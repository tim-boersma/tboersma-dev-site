import appInsights from 'applicationinsights';

let isInitialized = false;

const getTelemetryClient = () => {
  const config = useRuntimeConfig();
  const connectionString = config.appInsightsConnectionString;

  if (!connectionString) {
    return null;
  }

  if (!isInitialized) {
    appInsights
      .setup(connectionString)
      .setAutoCollectConsole(false)
      .setAutoCollectDependencies(false)
      .setAutoCollectExceptions(false)
      .setAutoCollectPerformance(false, false)
      .setAutoCollectRequests(false)
      .setUseDiskRetryCaching(true)
      .start();

    isInitialized = true;
  }

  return appInsights.defaultClient;
};

const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  return new Error('Unknown proxy error');
};

export interface ProxyErrorContext {
  route: string;
  targetPath: string;
  method: string;
  upstreamStatus?: number;
}

export const trackProxyError = (error: unknown, context: ProxyErrorContext): void => {
  const client = getTelemetryClient();

  if (!client) {
    return;
  }

  const normalizedError = toError(error);

  client.trackException({
    exception: normalizedError,
    properties: {
      route: context.route,
      targetPath: context.targetPath,
      method: context.method,
      upstreamStatus: context.upstreamStatus ? String(context.upstreamStatus) : 'unknown',
    },
  });
};
