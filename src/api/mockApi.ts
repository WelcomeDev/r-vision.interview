import { apiConfig } from './config';
import { ApiError, ApiValidationError, Asset, CreateScanJobPayload, CreateScanJobResult, Option } from './types';

const GROUPS: Option[] = [
  { value: 'dmz', label: 'DMZ' },
  { value: 'office', label: 'Офисная сеть' },
  { value: 'prod', label: 'Продуктивный контур' },
  { value: 'dev', label: 'Разработка' },
];

const OS_LIST = ['Ubuntu 22.04', 'Debian 12', 'Windows Server 2019', 'RHEL 9', 'Astra Linux 1.7'];

const ASSETS: Asset[] = Array.from({ length: 28 }, (_, index) => {
  const group = GROUPS[index % GROUPS.length];
  const criticality = (['low', 'medium', 'high', 'critical'] as const)[index % 4];

  return {
    id: `asset-${index + 1}`,
    hostname: `${group.value}-srv-${String(index + 1).padStart(2, '0')}`,
    ip: `10.${10 + (index % 4)}.${Math.floor(index / 4)}.${20 + index}`,
    os: OS_LIST[index % OS_LIST.length],
    groupId: group.value,
    groupName: group.label,
    criticality,
  };
});

const TAGS: Option[] = [
  { value: 'pci-dss', label: 'PCI DSS' },
  { value: 'gost', label: 'ГОСТ Р 57580' },
  { value: 'external', label: 'Внешний периметр' },
  { value: 'quarterly', label: 'Ежеквартальный аудит' },
  { value: 'legacy', label: 'Legacy-системы' },
  { value: 'critical-infra', label: 'КИИ' },
];

const SCAN_TYPES: Option[] = [
  { value: 'inventory', label: 'Инвентаризация', description: 'сбор данных об активах' },
  { value: 'vuln', label: 'Поиск уязвимостей' },
  { value: 'compliance', label: 'Проверка соответствия' },
];

const PROFILES: Record<string, Option[]> = {
  inventory: [
    { value: 'inv-fast', label: 'Быстрая инвентаризация' },
    { value: 'inv-full', label: 'Полная инвентаризация' },
  ],
  vuln: [
    { value: 'vuln-safe', label: 'Безопасные проверки' },
    { value: 'vuln-full', label: 'Полный набор проверок' },
    { value: 'vuln-web', label: 'Web-приложения' },
  ],
  compliance: [
    { value: 'cis', label: 'CIS Benchmarks' },
    { value: 'gost-57580', label: 'ГОСТ Р 57580.1' },
  ],
};

/** Имена, уже занятые «на бэкенде» — для асинхронной проверки уникальности. */
const TAKEN_NAMES = ['nightly scan', 'аудит dmz', 'weekly vuln scan'];

function delay<T>(value: T, ms = apiConfig.latencyMs, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      if (Math.random() < apiConfig.failureRate) {
        reject(new ApiError('Сервис временно недоступен', 500));
        return;
      }
      resolve(value);
    }, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export const api = {
  getScanTypes: (signal?: AbortSignal) => delay(SCAN_TYPES, 200, signal),

  getProfiles: (scanType: string, signal?: AbortSignal) => delay(PROFILES[scanType] ?? [], 700, signal),

  getTags: (signal?: AbortSignal) => delay(TAGS, 300, signal),

  getAssetGroups: (signal?: AbortSignal) => delay(GROUPS, 200, signal),

  getAssets: (params: { search?: string; groupId?: string | null } = {}, signal?: AbortSignal) => {
    const search = params.search?.trim().toLowerCase() ?? '';

    const rows = ASSETS.filter((asset) => {
      const byGroup = !params.groupId || asset.groupId === params.groupId;
      const bySearch =
        !search || asset.hostname.toLowerCase().includes(search) || asset.ip.includes(search);
      return byGroup && bySearch;
    });

    return delay(rows, 800, signal);
  },

  /** Асинхронная проверка уникальности имени задачи. */
  checkJobName: (name: string, signal?: AbortSignal) =>
    delay({ available: !TAKEN_NAMES.includes(name.trim().toLowerCase()) }, 600, signal),

  /**
   * Создание задачи.
   * Бэкенд повторно валидирует данные и может вернуть 422 с ошибками по полям:
   *  - имя, содержащее «demo», считается занятым;
   *  - критичные активы нельзя сканировать полным набором проверок.
   */
  createScanJob: async (payload: CreateScanJobPayload): Promise<CreateScanJobResult> => {
    await delay(null, 1200);

    const fieldErrors: Record<string, string> = {};

    if (/demo/i.test(payload.general.name)) {
      fieldErrors['general.name'] = 'Задача с таким именем уже существует';
    }

    const criticalIds = new Set(ASSETS.filter((a) => a.criticality === 'critical').map((a) => a.id));
    const hasCritical = payload.scope.targets.some((target) => criticalIds.has(target.assetId));

    if (hasCritical && payload.general.profileId === 'vuln-full') {
      fieldErrors['general.profileId'] =
        'Профиль «Полный набор проверок» недоступен для активов с критичностью «critical»';
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw new ApiValidationError('Не удалось создать задачу', fieldErrors);
    }

    return { id: `job-${Math.floor(Math.random() * 9000) + 1000}`, createdAt: new Date().toISOString() };
  },
};
