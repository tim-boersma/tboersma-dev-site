import { fileURLToPath } from 'node:url';
import { config as dotenvConfig } from 'dotenv';
import Aura from '@primeuix/themes/aura';

dotenvConfig({ path: '.env.local' });

export default defineNuxtConfig({
  compatibilityDate: '2026-06-15',
  modules: [
      '@pinia/nuxt',
      '@primevue/nuxt-module',
  ],
  primevue: {
    options: {
      theme: {
        preset: Aura
      }
    }
  },
  devtools: {
    enabled: true,
  },
  debug: true,
  alias: {
    '~': fileURLToPath(new URL('./', import.meta.url)),
    '@': fileURLToPath(new URL('./app/', import.meta.url)),
  },
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },
  css: [
    './app/styles/tailwind.css',
    'primeicons/primeicons.css',
  ],
  runtimeConfig: {
    azureFunctionUrl: process.env.AZURE_FUNCTION_URL,
    apiFunctionMasterKey: process.env.API_FUNCTION_MASTER_KEY,
    appInsightsConnectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || '',
    public: {
    },
  },
  ssr: false,
  nitro: {
    preset: 'static'
  }
});
