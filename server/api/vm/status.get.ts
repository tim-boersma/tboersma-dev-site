import { getAzureHttpClient } from '@/api/httpClient';
import { trackProxyError } from '../../utils/app-insights';

export default defineEventHandler(async () => {
  try {
    const azureHttpClient = getAzureHttpClient();
    const response = await azureHttpClient.get<string>('vm/status');

    return response.data;
  } catch (error: any) {
    trackProxyError(error, {
      route: '/api/vm/status',
      targetPath: '/api/vm/status',
      method: 'GET',
      upstreamStatus: error?.statusCode || error?.response?.status,
    });

    throw createError({
      statusCode: error?.statusCode || error?.response?.status || 500,
      statusMessage: error?.message || 'Failed to fetch VM status',
    });
  }
});
