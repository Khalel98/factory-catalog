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
          if (category.parentId) {
            ctx.routes.add(`/catalog/${category.parentId}/${category.id}`);
          }
          const productsData = readFileSync(categoryFilePath, 'utf-8');
          const products = JSON.parse(productsData);

          for (const product of products) {
            if (product.id) {
              const route = category.parentId
                ? `/catalog/${category.parentId}/${category.id}/${product.id}`
                : `/catalog/${category.id}/${product.id}`;
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
