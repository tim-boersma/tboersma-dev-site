import { getAzureHttpClient } from '@/api/httpClient';
import { trackProxyError } from '~/server/utils/app-insights';

interface ToggleBody {
  state: boolean;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ToggleBody>(event);

  if (typeof body?.state !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Body must include boolean state',
    });
  }

  try {
    const azureHttpClient = getAzureHttpClient();

    const response = await azureHttpClient.put(`vm/manual?state=${body.state}`);

    return response.data;
  } catch (error: any) {
    trackProxyError(error, {
      route: '/api/vm/toggle',
      targetPath: `/api/vm/manual?state=${body.state}`,
      method: 'PUT',
      upstreamStatus: error?.statusCode || error?.response?.status,
    });

    throw createError({
      statusCode: error?.statusCode || error?.response?.status || 500,
      statusMessage: error?.message || 'Failed to toggle VM',
    });
  }
});
