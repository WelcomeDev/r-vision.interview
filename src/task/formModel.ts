import type { StepDescriptor } from '../components';

/** Модель данных мастера. Менять можно как угодно — это отправная точка. */
export interface ScanJobFormValues {
  general: {
    name: string;
    scanType: string | null;
    profileId: string | null;
    tags: string[];
  };
  scope: {
    /** id выбранных активов */
    assetIds: string[];
    /** портовая строка по каждому активу: assetId -> «22,80,443» */
    ports: Record<string, string>;
  };
  schedule: {
    periodicity: string | null;
    time: string;
    recipientIds: string[];
    onlyCritical: boolean;
  };
}

export const defaultValues: ScanJobFormValues = {
  general: { name: '', scanType: null, profileId: null, tags: [] },
  scope: { assetIds: [], ports: {} },
  schedule: { periodicity: null, time: '', recipientIds: [], onlyCritical: false },
};

export const STEPS: StepDescriptor[] = [
  { id: 'general', title: 'Основное' },
  { id: 'scope', title: 'Область сканирования' },
  { id: 'schedule', title: 'Расписание и уведомления' },
  { id: 'confirm', title: 'Подтверждение' },
];
