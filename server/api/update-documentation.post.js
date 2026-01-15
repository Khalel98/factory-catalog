import { google } from "googleapis";
import { readFile, writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import formidable from "formidable";
import { readFileSync } from "fs";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { productId, categoryId, documentation: documentationData, files: filesInfo = [] } = body;

    if (!productId || !categoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Необходимы productId и categoryId",
      });
    }

    // Парсим documentation, если это строка, или используем как есть
    let documentation = null;
    if (documentationData) {
      if (typeof documentationData === 'string') {
        try {
          documentation = JSON.parse(documentationData);
        } catch (e) {
          console.warn('Ошибка парсинга documentation:', e);
          documentation = { blocks: [] };
        }
      } else {
        documentation = documentationData;
      }
    } else {
      // Если документации нет, создаем пустую структуру
      documentation = { blocks: [] };
    }

    // Проверяем структуру документации
    if (!documentation.blocks || !Array.isArray(documentation.blocks)) {
      documentation = { blocks: [] };
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
    const documentationIndex = headers.findIndex(
      (h) => h?.toLowerCase() === "documentation"
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

    // Получаем старую документацию для сравнения и удаления файлов
    let oldDocumentation = null;
    if (documentationIndex !== -1 && rows[productRowIndex - 1] && rows[productRowIndex - 1][documentationIndex]) {
      try {
        const oldDocString = rows[productRowIndex - 1][documentationIndex];
        if (oldDocString && typeof oldDocString === 'string' && oldDocString.trim()) {
          oldDocumentation = JSON.parse(oldDocString);
        }
      } catch (e) {
        console.warn('Не удалось распарсить старую документацию:', e);
      }
    }

    // Собираем пути к файлам из старой документации
    const oldFilePaths = new Set();
    if (oldDocumentation && oldDocumentation.blocks && Array.isArray(oldDocumentation.blocks)) {
      for (const block of oldDocumentation.blocks) {
        if (block && block.documents && Array.isArray(block.documents)) {
          for (const doc of block.documents) {
            if (doc && doc.path) {
              // Преобразуем путь в абсолютный путь к файлу
              const absolutePath = doc.path.startsWith('public/') 
                ? join(process.cwd(), doc.path)
                : join(process.cwd(), 'public', doc.path);
              oldFilePaths.add(absolutePath);
            }
          }
        }
      }
    }

    // Сохраняем файлы в public/documents/{categoryId}/{productId}
    const documentsDir = join(process.cwd(), "public", "documents", categoryId, productId);
    if (!existsSync(documentsDir)) {
      await mkdir(documentsDir, { recursive: true });
      console.log(`Создана директория для документов товара ${productId} категории ${categoryId}: ${documentsDir}`);
    }

    // Обрабатываем файлы (если они переданы как base64)
    if (documentation.blocks && Array.isArray(documentation.blocks)) {
      for (let blockIndex = 0; blockIndex < documentation.blocks.length; blockIndex++) {
        const block = documentation.blocks[blockIndex];
        if (!block || !block.documents || !Array.isArray(block.documents)) {
          continue;
        }
        
        for (let docIndex = 0; docIndex < block.documents.length; docIndex++) {
          const doc = block.documents[docIndex];
          if (!doc) continue;
          
          // Если файл передан как base64, сохраняем его
          if (doc.fileData && doc.fileName) {
            try {
              // Генерируем уникальное имя файла
              const timestamp = Date.now();
              const safeFileName = doc.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
              const fileExtension = safeFileName.split('.').pop() || '';
              const baseFileName = safeFileName.replace(/\.[^/.]+$/, '') || 'document';
              const fileName = `${productId}_${timestamp}_${baseFileName}.${fileExtension}`;
              const filePath = join(documentsDir, fileName);
              
              // Декодируем base64 и сохраняем файл
              const fileBuffer = Buffer.from(doc.fileData, 'base64');
              await writeFile(filePath, fileBuffer);
              
              // Обновляем пути в документе с учетом категории и товара
              doc.url = `/documents/${categoryId}/${productId}/${fileName}`;
              doc.path = `public/documents/${categoryId}/${productId}/${fileName}`;
              doc.fileName = safeFileName; // Сохраняем оригинальное имя для отображения
              
              // Удаляем base64 данные после сохранения
              delete doc.fileData;
              
              console.log(`Файл сохранен: ${filePath}`);
            } catch (fileError) {
              console.error(`Ошибка при сохранении файла ${doc.fileName}:`, fileError);
              // Продолжаем работу, даже если файл не сохранился
            }
          } else if (doc.url && !doc.path) {
            // Если есть URL, но нет пути, пытаемся определить путь
            if (doc.url.startsWith('/documents/')) {
              doc.path = `public${doc.url}`;
            }
          } else if (doc.url && doc.path) {
            // Обновляем старые пути, если они не содержат categoryId/productId
            const expectedPath = `/${categoryId}/${productId}/`;
            if (!doc.path.includes(expectedPath)) {
              const oldFileName = doc.url.split('/').pop();
              doc.url = `/documents/${categoryId}/${productId}/${oldFileName}`;
              doc.path = `public/documents/${categoryId}/${productId}/${oldFileName}`;
              
              // Пытаемся найти и переместить файл в новую директорию
              const possibleOldPaths = [
                join(process.cwd(), "public", "documents", oldFileName), // Старый формат: documents/filename
                join(process.cwd(), "public", "documents", categoryId, oldFileName), // Формат: documents/categoryId/filename
              ];
              
              for (const oldPath of possibleOldPaths) {
                if (existsSync(oldPath)) {
                  try {
                    const fileData = await readFile(oldPath);
                    await writeFile(join(documentsDir, oldFileName), fileData);
                    console.log(`Файл перемещен в директорию товара: ${oldFileName}`);
                    break;
                  } catch (moveError) {
                    console.warn(`Не удалось переместить файл ${oldFileName}:`, moveError);
                  }
                }
              }
            }
          }
        }
      }
    }

    // Обновляем или добавляем колонку documentation
    let updateRange;
    if (documentationIndex === -1) {
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
          values: [["documentation"]],
        },
      });
    } else {
      const columnLetter = String.fromCharCode(64 + documentationIndex + 1);
      updateRange = `${categorySheet.properties.title}!${columnLetter}${productRowIndex}`;
    }

    // Собираем пути к файлам из новой документации
    const newFilePaths = new Set();
    if (documentation && documentation.blocks && Array.isArray(documentation.blocks)) {
      for (const block of documentation.blocks) {
        if (block && block.documents && Array.isArray(block.documents)) {
          for (const doc of block.documents) {
            if (doc && doc.path) {
              // Преобразуем путь в абсолютный путь к файлу
              const absolutePath = doc.path.startsWith('public/') 
                ? join(process.cwd(), doc.path)
                : join(process.cwd(), 'public', doc.path);
              newFilePaths.add(absolutePath);
            }
          }
        }
      }
    }

    // Находим файлы, которые были удалены (есть в старом, но нет в новом)
    const filesToDelete = [];
    for (const oldPath of oldFilePaths) {
      if (!newFilePaths.has(oldPath) && existsSync(oldPath)) {
        filesToDelete.push(oldPath);
      }
    }

    // Удаляем файлы, которые больше не используются
    for (const filePath of filesToDelete) {
      try {
        await unlink(filePath);
        console.log(`Удален файл: ${filePath}`);
      } catch (deleteError) {
        console.error(`Ошибка при удалении файла ${filePath}:`, deleteError);
        // Продолжаем работу, даже если файл не удалился
      }
    }

    // Очищаем временные данные перед сохранением в Google Sheets
    const documentationForSheets = JSON.parse(JSON.stringify(documentation));
    documentationForSheets.blocks?.forEach(block => {
      block.documents?.forEach(doc => {
        // Удаляем fileData и file, оставляем только url и path
        delete doc.fileData;
        delete doc.file;
      });
    });

    // Сохраняем документацию в Google Sheets
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: "RAW",
      resource: {
        values: [[JSON.stringify(documentationForSheets)]],
      },
    });

    console.log(`Документация сохранена в Google Sheets для продукта ${productId}`);

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
              // Используем очищенную версию документации (без fileData и file)
              categoryData[productIndex].documentation = documentationForSheets;
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

    // Возвращаем очищенную версию документации (без fileData и file)
    return {
      success: true,
      documentation: documentationForSheets,
      message: 'Документация успешно сохранена в Google Sheets и локальные файлы обновлены',
    };
  } catch (error) {
    console.error("Ошибка при сохранении документации:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Ошибка при сохранении документации",
    });
  }
});
