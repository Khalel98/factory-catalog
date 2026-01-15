import { google } from "googleapis";
import { readFile, writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { productId, categoryId, images = [] } = body;

    if (!productId || !categoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Необходимы productId и categoryId",
      });
    }

    // Получаем credentials из JSON файла
    const credentialsPath = join(
      process.cwd(),
      "google-sheets-credentials.json"
    );
    const credentialsData = await readFile(credentialsPath, "utf-8");
    const config = JSON.parse(credentialsData);

    const credentials = {
      type: config.type,
      project_id: config.project_id,
      private_key_id: config.private_key_id,
      private_key: config.private_key,
      client_email: config.client_email,
      client_id: config.client_id,
      auth_uri: config.auth_uri,
      token_uri: config.token_uri,
      auth_provider_x509_cert_url: config.auth_provider_x509_cert_url,
      client_x509_cert_url: config.client_x509_cert_url,
    };

    const spreadsheetId = config.spreadsheet_id || "";

    if (
      !credentials.client_email ||
      !credentials.private_key ||
      !spreadsheetId
    ) {
      throw new Error(
        "Google Sheets credentials not configured. Создайте файл google-sheets-credentials.json"
      );
    }

    // Исправляем форматирование private_key
    let privateKey = credentials.private_key;
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    // Настраиваем аутентификацию
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    await auth.getAccessToken();

    const sheets = google.sheets({ version: "v4", auth });

    // Получаем список листов
    const sheetsList = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const categorySheet = sheetsList.data.sheets.find(
      (s) => s.properties?.title?.toLowerCase() === categoryId.toLowerCase()
    );

    if (!categorySheet) {
      throw new Error(`Лист категории "${categoryId}" не найден`);
    }

    // Читаем данные листа
    const range = `${categorySheet.properties.title}!A:Z`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    if (!rows || rows.length < 2) {
      throw new Error("Лист пуст или не содержит заголовков");
    }

    const headers = rows[0] || [];
    const idIndex = headers.findIndex((h) => h?.toLowerCase() === "id");
    const imagesIndex = headers.findIndex(
      (h) => h?.toLowerCase() === "images"
    );

    if (idIndex === -1) {
      throw new Error("Колонка 'id' не найдена");
    }

    // Находим строку продукта
    let productRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && rows[i][idIndex] === productId) {
        productRowIndex = i + 1; // +1 потому что в Sheets строки начинаются с 1
        break;
      }
    }

    if (productRowIndex === -1) {
      throw new Error(`Продукт с id "${productId}" не найден`);
    }

    // Получаем старые изображения для сравнения и удаления файлов
    let oldImages = [];
    if (imagesIndex !== -1 && rows[productRowIndex - 1] && rows[productRowIndex - 1][imagesIndex]) {
      try {
        const oldImagesString = rows[productRowIndex - 1][imagesIndex];
        if (oldImagesString && typeof oldImagesString === 'string' && oldImagesString.trim()) {
          oldImages = JSON.parse(oldImagesString);
        }
      } catch (e) {
        console.warn('Не удалось распарсить старые изображения:', e);
      }
    }

    // Собираем пути к файлам из старых изображений
    const oldImagePaths = new Set();
    if (Array.isArray(oldImages)) {
      for (const oldImage of oldImages) {
        if (oldImage && typeof oldImage === 'string') {
          // Если это URL, преобразуем в путь
          if (oldImage.startsWith('/images/')) {
            const absolutePath = join(process.cwd(), 'public', oldImage);
            oldImagePaths.add(absolutePath);
          }
        } else if (oldImage && oldImage.path) {
          const absolutePath = oldImage.path.startsWith('public/') 
            ? join(process.cwd(), oldImage.path)
            : join(process.cwd(), 'public', oldImage.path);
          oldImagePaths.add(absolutePath);
        }
      }
    }

    // Сохраняем файлы в public/images/{categoryId}/{productId}
    const imagesDir = join(process.cwd(), "public", "images", categoryId, productId);
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true });
      console.log(`Создана директория для изображений товара ${productId} категории ${categoryId}: ${imagesDir}`);
    }

    // Обрабатываем изображения
    const processedImages = [];
    for (let index = 0; index < images.length; index++) {
      const image = images[index];
      if (!image) continue;

      // Если файл передан как base64, сохраняем его
      if (image.fileData && image.fileName) {
        try {
          // Генерируем уникальное имя файла
          const timestamp = Date.now();
          const safeFileName = image.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
          const fileExtension = safeFileName.split('.').pop() || 'jpg';
          const baseFileName = safeFileName.replace(/\.[^/.]+$/, '') || 'image';
          const fileName = `${productId}_${timestamp}_${index}_${baseFileName}.${fileExtension}`;
          const filePath = join(imagesDir, fileName);
          
          // Декодируем base64 и сохраняем файл
          const fileBuffer = Buffer.from(image.fileData, 'base64');
          await writeFile(filePath, fileBuffer);
          
          // Сохраняем URL изображения
          const imageUrl = `/images/${categoryId}/${productId}/${fileName}`;
          processedImages.push(imageUrl);
          
          console.log(`Изображение сохранено: ${filePath}`);
        } catch (fileError) {
          console.error(`Ошибка при сохранении изображения ${image.fileName}:`, fileError);
          // Продолжаем работу, даже если файл не сохранился
        }
      } else if (image.url) {
        // Если есть URL, сохраняем его
        processedImages.push(image.url);
      }
    }

    // Собираем пути к файлам из новых изображений
    const newImagePaths = new Set();
    for (const imageUrl of processedImages) {
      if (imageUrl.startsWith('/images/')) {
        const absolutePath = join(process.cwd(), 'public', imageUrl);
        newImagePaths.add(absolutePath);
      }
    }

    // Находим изображения, которые были удалены (есть в старом, но нет в новом)
    const imagesToDelete = [];
    for (const oldPath of oldImagePaths) {
      if (!newImagePaths.has(oldPath) && existsSync(oldPath)) {
        imagesToDelete.push(oldPath);
      }
    }

    // Удаляем изображения, которые больше не используются
    for (const imagePath of imagesToDelete) {
      try {
        await unlink(imagePath);
        console.log(`Удалено изображение: ${imagePath}`);
      } catch (deleteError) {
        console.error(`Ошибка при удалении изображения ${imagePath}:`, deleteError);
        // Продолжаем работу, даже если файл не удалился
      }
    }

    // Обновляем или добавляем колонку images
    let updateRange;
    if (imagesIndex === -1) {
      // Добавляем новую колонку
      const newColumnIndex = headers.length + 1;
      const columnLetter = String.fromCharCode(64 + newColumnIndex);
      updateRange = `${categorySheet.properties.title}!${columnLetter}${productRowIndex}`;
      
      // Добавляем заголовок
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${categorySheet.properties.title}!${columnLetter}1`,
        valueInputOption: "RAW",
        resource: {
          values: [["Images"]],
        },
      });
    } else {
      const columnLetter = String.fromCharCode(64 + imagesIndex + 1);
      updateRange = `${categorySheet.properties.title}!${columnLetter}${productRowIndex}`;
    }

    // Сохраняем изображения в Google Sheets как JSON массив
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: "RAW",
      resource: {
        values: [[JSON.stringify(processedImages)]],
      },
    });

    console.log(`Изображения сохранены в Google Sheets для продукта ${productId}`);

    // Обновляем локальный JSON файл
    const categoryDataPath = join(
      process.cwd(),
      "public",
      "data",
      `${categoryId}.json`
    );

    if (existsSync(categoryDataPath)) {
      try {
        const categoryDataContent = await readFile(categoryDataPath, "utf-8");
        if (categoryDataContent) {
          const categoryData = JSON.parse(categoryDataContent);
          if (Array.isArray(categoryData)) {
            const productIndex = categoryData.findIndex((p) => p && p.id === productId);
            
            if (productIndex !== -1) {
              categoryData[productIndex].images = processedImages;
              await writeFile(categoryDataPath, JSON.stringify(categoryData, null, 2));
              console.log(`Локальный файл обновлен: ${categoryDataPath}`);
            } else {
              console.warn(`Продукт ${productId} не найден в локальном файле`);
            }
          }
        }
      } catch (fileError) {
        console.error('Ошибка при обновлении локального файла:', fileError);
        // Продолжаем работу, даже если локальный файл не обновился
      }
    } else {
      console.warn(`Локальный файл не найден: ${categoryDataPath}`);
    }

    return {
      success: true,
      images: processedImages,
      message: 'Изображения успешно сохранены в Google Sheets и локальные файлы обновлены',
    };
  } catch (error) {
    console.error("Ошибка при сохранении изображений:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Ошибка при сохранении изображений",
    });
  }
});
