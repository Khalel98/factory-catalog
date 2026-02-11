// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Читаем конфигурацию из google-sheets-credentials.json
let googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSekBcahye-u5f7GHg5DyCkmuGLjs3gTIq4YzEKFccD1iNzvmQ/viewform?embedded=true';
let staticFormsApiKey = '';

try {
  const credentialsPath = join(process.cwd(), 'google-sheets-credentials.json');
  const credentialsData = readFileSync(credentialsPath, 'utf-8');
  const config = JSON.parse(credentialsData);
  if (config.google_form_url) {
    googleFormUrl = config.google_form_url;
  }
  if (config.static_forms_api_key) {
    staticFormsApiKey = config.static_forms_api_key;
  }
} catch (error) {
  console.warn('Не удалось прочитать google-sheets-credentials.json, используется значение по умолчанию');
}

// Генерируем маршруты для пререндера: категории + товары (все как папки с index.html)
function generatePrerenderRoutes() {
  const routes: string[] = [];
  try {
    const publicDataDir = join(process.cwd(), 'public/data');
    const categoriesPath = join(publicDataDir, 'categories.json');

    if (!existsSync(categoriesPath)) {
      console.warn('Файл categories.json не найден, пропускаем генерацию маршрутов');
      return routes;
    }

    const categoriesData = readFileSync(categoriesPath, 'utf-8');
    const categories = JSON.parse(categoriesData);

    for (const category of categories) {
      // Маршруты категорий (чтобы генерировались catalog/slug/index.html, а не catalog/slug.html)
      if (category.parentId) {
        routes.push(`/catalog/${category.parentId}/${category.id}`);
      } else {
        routes.push(`/catalog/${category.id}`);
      }

      const categoryFilePath = join(publicDataDir, `${category.id}.json`);
      if (!existsSync(categoryFilePath)) continue;

      try {
        const productsData = readFileSync(categoryFilePath, 'utf-8');
        const products = JSON.parse(productsData);
        for (const product of products) {
          if (product.id) {
            if (category.parentId) {
              routes.push(`/catalog/${category.parentId}/${category.id}/${product.id}`);
            } else {
              routes.push(`/catalog/${category.id}/${product.id}`);
            }
          }
        }
      } catch (error) {
        console.warn(`Не удалось загрузить товары для категории ${category.id}:`, error);
      }
    }
  } catch (error) {
    console.warn('Ошибка при генерации маршрутов для пререндера:', error);
  }

  return routes;
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
  experimental: {
    // Отключает запрос /_nuxt/builds/meta/dev.json, который даёт 404 в dev/static
    appManifest: false,
    // Ссылки всегда со слэшем → совпадает со структурой папок (catalog/slug/index.html)
    defaults: {
      nuxtLink: { trailingSlash: 'append' }
    }
  },
  css: ['@/assets/styles/main.scss'],
  srcDir: 'app',
  runtimeConfig: {
    public: {
      // URL Google Forms опросника
      // Для встраивания используется ?embedded=true вместо ?usp=publish-editor
      googleFormUrl: process.env.GOOGLE_FORM_URL || googleFormUrl,
      // StaticForms — форма обратной связи без сервера (работает при SSG/nuxt generate), ключ из google-sheets-credentials.json
      staticFormsApiKey
    }
  },
  // Все маршруты статичные (SSG)
  routeRules: {
    '/**': { static: true }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      // Все маршруты (категории + товары) → всегда папка с index.html, без .html файлов
      routes: generatePrerenderRoutes(),
      failOnError: false,
      // ВАЖНО: всегда папки с index.html (catalog/portable-devices/index.html), иначе часть страниц = .html → 403 при /slug/
      autoSubfolderIndex: true
    }
  }
})
