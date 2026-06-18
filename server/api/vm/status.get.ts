import { getAzureHttpClient } from '@/api/httpClient';
import { trackProxyError } from '~/server/utils/app-insights';
import { toError } from '~/server/utils/lib';

export default defineEventHandler(async () => {
  try {
    const azureHttpClient = getAzureHttpClient();
    const response = await azureHttpClient.get<string>('vm/status');

    return response.data;
  } catch (error: any) {
    var trackedError = toError(error);
    trackProxyError(trackedError, {
      route: '/api/vm/status',
      targetPath: '/api/vm/status',
      method: 'GET',
      upstreamStatus: error?.status || error?.response?.status,
    });

    throw createError({
      statusCode: error?.status || error?.response?.status || 500,
      statusMessage: error?.message || 'Failed to fetch VM status',
    });
  }
});
