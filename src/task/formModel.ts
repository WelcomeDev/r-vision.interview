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
}

export const defaultValues: ScanJobFormValues = {
  general: { name: '', scanType: null, profileId: null, tags: [] },
  scope: { assetIds: [], ports: {} },
};

export const STEPS: StepDescriptor[] = [
  { id: 'general', title: 'Основное' },
  { id: 'scope', title: 'Область сканирования' },
  { id: 'confirm', title: 'Подтверждение' },
];
