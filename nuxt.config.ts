import { fileURLToPath } from 'node:url';
import { config as dotenvConfig } from 'dotenv';
import Aura from '@primeuix/themes/aura';

dotenvConfig({ path: '.env' });

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
    //.env variables prefixed with NUXT_ are automatically filled in
    azureFunctionUrl: '',
    apiFunctionMasterKey: '',
    applicationinsightsConnectionString: '',
    public: {
      //.env variables prefixed with NUXT_PUBLIC_ are automatically added
    },
  },
  ssr: false,
  nitro: {
    preset: 'static'
  }
});
