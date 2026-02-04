import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('prerender:routes', async (ctx) => {
    // Генерируем маршруты для всех товаров из JSON файлов
    try {
      const publicDataDir = join(process.cwd(), 'public/data');
      const categoriesPath = join(publicDataDir, 'categories.json');
      
      if (!existsSync(categoriesPath)) {
        console.warn('Файл categories.json не найден, пропускаем генерацию маршрутов');
        return;
      }

      const categoriesData = readFileSync(categoriesPath, 'utf-8');
      const categories = JSON.parse(categoriesData);

      for (const category of categories) {
        const categoryFilePath = join(publicDataDir, `${category.id}.json`);
        
        if (!existsSync(categoryFilePath)) {
          console.warn(`Файл ${category.id}.json не найден, пропускаем`);
          continue;
        }
        
        try {
          const productsData = readFileSync(categoryFilePath, 'utf-8');
          const products = JSON.parse(productsData);

          for (const product of products) {
            if (product.id) {
              // Добавляем маршрут для каждого товара
              const route = `/catalog/${product.id}`;
              ctx.routes.add(route);
              console.log(`Добавлен маршрут для генерации: ${route}`);
            }
          }
        } catch (error) {
          console.warn(`Не удалось загрузить товары для категории ${category.id}:`, error);
        }
      }
    } catch (error) {
      console.warn('Ошибка при генерации маршрутов для товаров:', error);
    }
  });
});
