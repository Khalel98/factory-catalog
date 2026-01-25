import { google } from "googleapis";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { readFileSync } from "fs";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { productId, categoryId, videos: videosData } = body;

    if (!productId || !categoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Необходимы productId и categoryId",
      });
    }

    // Парсим videos, если это строка, или используем как есть
    let videos = null;
    if (videosData) {
      if (typeof videosData === 'string') {
        try {
          videos = JSON.parse(videosData);
        } catch (e) {
          console.warn('Ошибка парсинга videos:', e);
          videos = { blocks: [] };
        }
      } else {
        videos = videosData;
      }
    } else {
      // Если видео нет, создаем пустую структуру
      videos = { blocks: [] };
    }

    // Проверяем структуру видео
    if (!videos.blocks || !Array.isArray(videos.blocks)) {
      videos = { blocks: [] };
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
    
    // Убираем лишние пробелы в начале и конце
    privateKey = privateKey.trim();
    
    // Обрабатываем различные форматы экранирования
    if (privateKey.includes("\\n") && !privateKey.includes("\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }
    if (privateKey.includes("\\\\n")) {
      privateKey = privateKey.replace(/\\\\n/g, "\n");
    }

    // Настраиваем аутентификацию
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    try {
      await auth.getAccessToken();
    } catch (authError) {
      if (authError.message && authError.message.includes("invalid_grant")) {
        throw new Error(
          "Ошибка аутентификации Google: Invalid JWT Signature. " +
          "Возможные причины:\n" +
          "1. Приватный ключ поврежден или неверен\n" +
          "2. Ключ сервисного аккаунта был пересоздан в Google Cloud Console\n" +
          "3. Сервисный аккаунт был удален или отключен\n\n" +
          "Решение: Скачайте новый JSON файл ключа из Google Cloud Console " +
          "(IAM & Admin > Service Accounts > ваш аккаунт > Keys) и обновите google-sheets-credentials.json"
        );
      }
      throw authError;
    }

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
    const videosIndex = headers.findIndex(
      (h) => h?.toLowerCase() === "videos"
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

    // Обновляем или добавляем колонку videos
    let updateRange;
    if (videosIndex === -1) {
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
          values: [["videos"]],
        },
      });
    } else {
      const columnLetter = String.fromCharCode(64 + videosIndex + 1);
      updateRange = `${categorySheet.properties.title}!${columnLetter}${productRowIndex}`;
    }

    // Сохраняем видео в Google Sheets
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: "RAW",
      resource: {
        values: [[JSON.stringify(videos)]],
      },
    });

    console.log(`Видео сохранены в Google Sheets для продукта ${productId}`);

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
              categoryData[productIndex].videos = videos;
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

    // Возвращаем данные видео
    return {
      success: true,
      videos: videos,
      message: 'Видео успешно сохранены в Google Sheets и локальные файлы обновлены',
    };
  } catch (error) {
    console.error("Ошибка при сохранении видео:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Ошибка при сохранении видео",
    });
  }
});
