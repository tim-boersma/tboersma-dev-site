import appInsights from 'applicationinsights';

export interface ProxyErrorContext {
  route: string;
  targetPath: string;
  method: string;
  upstreamStatus?: number;
}

export const trackProxyError = (error: Error, context: ProxyErrorContext): void => {
  const client = appInsights.defaultClient;

  if (!client) {
    return;
  }

  try {
    client.trackException({
      exception: error,
      properties: {
        route: context.route,
        targetPath: context.targetPath,
        method: context.method,
        upstreamStatus: context.upstreamStatus ? String(context.upstreamStatus) : 'unknown',
      },
    });
    client.flush();
  }
  catch (err) { console.error(err) }
};
