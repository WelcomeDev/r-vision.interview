import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

import { api } from './mockApi';
import { ApiError, ApiValidationError, Asset, CreateScanJobPayload, CreateScanJobResult, Option } from './types';

/** Ошибка в формате RTK Query: fieldErrors переживают дорогу до компонента. */
export interface ScanApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}

function toScanApiError(error: unknown): ScanApiError {
  if (error instanceof ApiValidationError) {
    return { status: error.status, message: error.message, fieldErrors: error.fieldErrors };
  }
  if (error instanceof ApiError) {
    return { status: error.status, message: error.message };
  }
  return { status: 0, message: (error as Error).message ?? 'Неизвестная ошибка' };
}

/** Оборачивает промис мок-API в контракт queryFn. */
async function run<T>(loader: () => Promise<T>) {
  try {
    return { data: await loader() };
  } catch (error) {
    return { error: toScanApiError(error) };
  }
}

export interface AssetsQueryArgs {
  search?: string;
  groupId?: string | null;
}

export const scanApi = createApi({
  reducerPath: 'scanApi',
  // транспорта нет: под капотом мок-API из mockApi.ts
  baseQuery: fakeBaseQuery<ScanApiError>(),
  tagTypes: ['ScanJob'],
  endpoints: (builder) => ({
    getScanTypes: builder.query<Option[], void>({
      queryFn: () => run(() => api.getScanTypes()),
    }),
    getProfiles: builder.query<Option[], string>({
      queryFn: (scanType) => run(() => api.getProfiles(scanType)),
    }),
    getTags: builder.query<Option[], void>({
      queryFn: () => run(() => api.getTags()),
    }),
    getAssetGroups: builder.query<Option[], void>({
      queryFn: () => run(() => api.getAssetGroups()),
    }),
    // каждый набор аргументов — своя запись в кеше, поэтому «гонки» ответов не случается
    getAssets: builder.query<Asset[], AssetsQueryArgs>({
      queryFn: (args) => run(() => api.getAssets(args)),
    }),
    checkJobName: builder.query<{ available: boolean }, string>({
      queryFn: (name) => run(() => api.checkJobName(name)),
    }),
    createScanJob: builder.mutation<CreateScanJobResult, CreateScanJobPayload>({
      queryFn: (payload) => run(() => api.createScanJob(payload)),
      invalidatesTags: ['ScanJob'],
    }),
  }),
});

export const {
  useGetScanTypesQuery,
  useGetProfilesQuery,
  useGetTagsQuery,
  useGetAssetGroupsQuery,
  useGetAssetsQuery,
  useLazyCheckJobNameQuery,
  useCreateScanJobMutation,
} = scanApi;
