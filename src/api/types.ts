export type Criticality = 'low' | 'medium' | 'high' | 'critical';

export interface Asset {
  id: string;
  hostname: string;
  ip: string;
  os: string;
  groupId: string;
  groupName: string;
  criticality: Criticality;
}

export interface Option {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ScanTargetPayload {
  assetId: string;
  /** Строка портов: «22,80,443» или «1000-2000». */
  ports: string;
}

export interface CreateScanJobPayload {
  general: {
    name: string;
    scanType: string;
    profileId: string;
    tags: string[];
  };
  scope: {
    targets: ScanTargetPayload[];
  };
}

export interface CreateScanJobResult {
  id: string;
  createdAt: string;
}

/** Ошибка бэкенда с привязкой к полям формы (путь в формате react-hook-form). */
export class ApiValidationError extends Error {
  readonly status = 422;

  constructor(
    message: string,
    readonly fieldErrors: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiValidationError';
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
