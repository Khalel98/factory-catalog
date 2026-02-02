// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from 'fs';
import { join } from 'path';

// Читаем конфигурацию из google-sheets-credentials.json
let googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSekBcahye-u5f7GHg5DyCkmuGLjs3gTIq4YzEKFccD1iNzvmQ/viewform?embedded=true';

try {
  const credentialsPath = join(process.cwd(), 'google-sheets-credentials.json');
  const credentialsData = readFileSync(credentialsPath, 'utf-8');
  const config = JSON.parse(credentialsData);
  if (config.google_form_url) {
    googleFormUrl = config.google_form_url;
  }
} catch (error) {
  console.warn('Не удалось прочитать google-sheets-credentials.json, используется значение по умолчанию');
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@/assets/styles/main.scss'],
  srcDir: 'app',
  runtimeConfig: {
    public: {
      // URL Google Forms опросника
      // Для встраивания используется ?embedded=true вместо ?usp=publish-editor
      googleFormUrl: process.env.GOOGLE_FORM_URL || googleFormUrl
    }
  }
})
