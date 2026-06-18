import { getAzureHttpClient } from '@/api/httpClient';
import { trackProxyError } from '~/server/utils/app-insights';
import { toError } from '~/server/utils/lib';

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
    var trackedError = toError(error);
    trackProxyError(trackedError, {
      route: '/api/vm/toggle',
      targetPath: `/api/vm/manual?state=${body.state}`,
      method: 'PUT',
      upstreamStatus: error?.status || error?.response?.status,
    });

    throw createError({
      statusCode: error?.status || error?.response?.status || 500,
      statusMessage: error?.message || 'Failed to toggle VM',
    });
  }
});
