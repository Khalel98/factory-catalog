import { google } from "googleapis";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export default defineEventHandler(async (event) => {
  try {
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

    if (!privateKey.includes("BEGIN PRIVATE KEY")) {
      throw new Error("Private key format error: missing BEGIN PRIVATE KEY");
    }
    if (!privateKey.includes("END PRIVATE KEY")) {
      throw new Error("Private key format error: missing END PRIVATE KEY");
    }

    // Настраиваем аутентификацию
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Проверяем аутентификацию
    await auth.getAccessToken();

    const sheets = google.sheets({ version: "v4", auth });

    // Получаем информацию о таблице
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheetsList = spreadsheetInfo.data.sheets || [];
    const result = {
      categories: [],
      products: {},
    };

    // Ищем лист с категориями
    const categoriesSheet = sheetsList.find(
      (s) => s.properties?.title?.toLowerCase() === "categories"
    );

    if (!categoriesSheet) {
      throw new Error("Лист 'Categories' не найден в таблице");
    }

    // Читаем колонки для локализации
    const categoriesRange = `${categoriesSheet.properties.title}!A:D`;
    const categoriesData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: categoriesRange,
    });

    const rows = categoriesData.data.values || [];
    const headers = rows[0] || [];
    
    // Определяем индексы колонок
    const idIndex = headers.findIndex((h) => h?.toLowerCase() === "id" || h === "");
    const nameRUIndex = headers.findIndex((h) => 
      h?.toLowerCase() === "name" || 
      h?.toLowerCase() === "nameru" || 
      h?.toLowerCase() === "name_ru"
    );
    const nameENIndex = headers.findIndex((h) => 
      h?.toLowerCase() === "nameen" || 
      h?.toLowerCase() === "name_en"
    );
    const nameKKIndex = headers.findIndex((h) => 
      h?.toLowerCase() === "namekk" || 
      h?.toLowerCase() === "name_kk"
    );
    
    // Пропускаем заголовок
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const id = row[idIndex]?.trim();
      const nameRU = row[nameRUIndex]?.trim() || row[1]?.trim();
      const nameEN = row[nameENIndex]?.trim() || "";
      const nameKK = row[nameKKIndex]?.trim() || "";
      
      if (id && nameRU) {
        result.categories.push({
          id: id,
          nameRU: nameRU,
          nameEN: nameEN || nameRU, // Если нет перевода, используем русское
          nameKK: nameKK || nameRU, // Если нет перевода, используем русское
        });
      }
    }

    // Загружаем товары из каждого листа категории
    for (const category of result.categories) {
      const categorySheet = sheetsList.find(
        (s) =>
          s.properties?.title?.toLowerCase() === category.id.toLowerCase()
      );

      if (!categorySheet) {
        result.products[category.id] = [];
        continue;
      }

      const productsRange = `${categorySheet.properties.title}!A:Z`;
      const productsData = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: productsRange,
      });

      const productRows = productsData.data.values || [];
      if (productRows.length < 2) {
        result.products[category.id] = [];
        continue;
      }

      const products = [];
      const headers = productRows[0] || [];
      const idIndex = headers.findIndex((h) => h?.toLowerCase() === "id");
      const nameIndex = headers.findIndex((h) => h?.toLowerCase() === "name");
      const priceIndex = headers.findIndex(
        (h) => h?.toLowerCase() === "price"
      );
      const imagesIndex = headers.findIndex(
        (h) => h?.toLowerCase() === "images"
      );
      
      // Локализованные поля GeneralInfo
      const generalInfoRUIndex = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "generalinfo" ||
          h?.toLowerCase() === "general_info" ||
          h?.toLowerCase() === "generalinforu" ||
          h?.toLowerCase() === "general_info_ru"
      );
      const generalInfoENIndex = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "generalinfoen" ||
          h?.toLowerCase() === "general_info_en"
      );
      const generalInfoKKIndex = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "generalinfokk" ||
          h?.toLowerCase() === "general_info_kk"
      );
      
      // Локализованные поля DescriptionHTML
      const descriptionRUIndex = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "descriptionhtml" ||
          h?.toLowerCase() === "description_html" ||
          h?.toLowerCase() === "descriptionhtmlru" ||
          h?.toLowerCase() === "description_html_ru"
      );
      const descriptionENIndex = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "descriptionhtmlen" ||
          h?.toLowerCase() === "description_html_en"
      );
      const descriptionKKIndex = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "descriptionhtmlkk" ||
          h?.toLowerCase() === "description_html_kk"
      );
      
      // Колонка documentation (JSON)
      const documentationIndex = headers.findIndex(
        (h) => h?.toLowerCase() === "documentation"
      );

      for (let i = 1; i < productRows.length; i++) {
        const row = productRows[i];
        if (!row[idIndex]) continue; // Пропускаем пустые строки

        const product = {
          id: row[idIndex]?.trim() || "",
          name: row[nameIndex]?.trim() || "",
          price: row[priceIndex]?.trim() || "",
          images: [],
          generalInfoRU: [],
          generalInfoEN: [],
          generalInfoKK: [],
          descriptionRU: "",
          descriptionEN: "",
          descriptionKK: "",
        };

        // Парсим images (JSON массив)
        if (row[imagesIndex]) {
          try {
            product.images = JSON.parse(row[imagesIndex]);
          } catch (e) {
            // Если не JSON, пробуем как строку с запятыми
            product.images = row[imagesIndex]
              .split(",")
              .map((img) => img.trim())
              .filter((img) => img);
          }
        }

        // Парсим generalInfo для каждого языка
        const parseGeneralInfo = (index) => {
          if (index === -1 || !row[index]) return [];
          try {
            return JSON.parse(row[index]);
          } catch (e) {
            // Если не JSON, пробуем как строку с переносами
            return row[index]
              .split("\n")
              .map((item) => item.trim())
              .filter((item) => item);
          }
        };

        product.generalInfoRU = parseGeneralInfo(generalInfoRUIndex);
        product.generalInfoEN = parseGeneralInfo(generalInfoENIndex);
        product.generalInfoKK = parseGeneralInfo(generalInfoKKIndex);
        
        // Если нет локализованных полей, используем русские для всех
        if (product.generalInfoEN.length === 0) {
          product.generalInfoEN = product.generalInfoRU;
        }
        if (product.generalInfoKK.length === 0) {
          product.generalInfoKK = product.generalInfoRU;
        }

        // Описания для каждого языка
        product.descriptionRU = row[descriptionRUIndex]?.trim() || "";
        product.descriptionEN = row[descriptionENIndex]?.trim() || "";
        product.descriptionKK = row[descriptionKKIndex]?.trim() || "";
        
        // Если нет локализованных полей, используем русские для всех
        if (!product.descriptionEN) {
          product.descriptionEN = product.descriptionRU;
        }
        if (!product.descriptionKK) {
          product.descriptionKK = product.descriptionRU;
        }

        // Парсим documentation (JSON)
        if (documentationIndex !== -1 && row[documentationIndex]) {
          try {
            product.documentation = JSON.parse(row[documentationIndex]);
          } catch (e) {
            console.warn(`Ошибка парсинга documentation для продукта ${product.id}:`, e);
            product.documentation = null;
          }
        }

        if (product.id && product.name) {
          products.push(product);
        }
      }

      result.products[category.id] = products;
    }

    // Сохраняем categories.json в public/data
    const publicDataDir = join(process.cwd(), "public/data");
    
    // Создаем папку, если её нет
    if (!existsSync(publicDataDir)) {
      await mkdir(publicDataDir, { recursive: true });
    }
    
    const categoriesPath = join(publicDataDir, "categories.json");
    await writeFile(
      categoriesPath,
      JSON.stringify(result.categories, null, 2),
      "utf-8"
    );

    // Сохраняем файлы для каждой категории в public/data
    // Имя файла генерируется автоматически: {id}.json
    for (const category of result.categories) {
      const fileName = `${category.id}.json`;
      const categoryFilePath = join(publicDataDir, fileName);
      const products = result.products[category.id] || [];
      await writeFile(
        categoryFilePath,
        JSON.stringify(products, null, 2),
        "utf-8"
      );
    }

    const totalProducts = Object.values(result.products).reduce(
      (sum, products) => sum + products.length,
      0
    );

    return {
      success: true,
      message: "Каталог успешно обновлен",
      stats: {
        categories: result.categories.length,
        products: totalProducts,
      },
      categories: result.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        productsCount: result.products[cat.id]?.length || 0,
      })),
    };
  } catch (error) {
    console.error("Error updating catalog:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Ошибка при обновлении каталога",
    });
  }
});
