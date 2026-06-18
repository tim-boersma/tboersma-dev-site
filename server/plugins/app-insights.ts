import appInsights from 'applicationinsights';

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();

  if (!config.applicationinsightsConnectionString) return;

  if (!appInsights.defaultClient) {
    appInsights
      .setup(config.applicationinsightsConnectionString)
      .setAutoCollectRequests(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectExceptions(true)
      .setUseDiskRetryCaching(true)
      .start();
  }
});