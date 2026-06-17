import { PiniaColada } from '@pinia/colada';
import { getPinia } from 'pinia';

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = getPinia();
  
  if (pinia) {
    // PiniaColada is already set up by @pinia/nuxt
    nuxtApp.vueApp.use(PiniaColada);
  }
});
