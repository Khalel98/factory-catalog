import { google } from "googleapis";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { productId, categoryId, description, language = 'ru' } = body;

    if (!productId || !categoryId || description === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: "Необходимы productId, categoryId и description",
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

    // Получаем информацию о таблице
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheetsList = spreadsheetInfo.data.sheets || [];

    // Находим лист категории
    const categorySheet = sheetsList.find(
      (s) => s.properties?.title?.toLowerCase() === categoryId.toLowerCase()
    );

    if (!categorySheet) {
      throw new Error(`Лист категории "${categoryId}" не найден`);
    }

    // Получаем данные листа
    const productsRange = `${categorySheet.properties.title}!A:Z`;
    const productsData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: productsRange,
    });

    const rows = productsData.data.values || [];
    if (rows.length < 2) {
      throw new Error("Нет данных в листе");
    }

    // Находим индексы колонок
    const headers = rows[0] || [];
    const idIndex = headers.findIndex((h) => h?.toLowerCase() === "id");
    
    // Определяем колонку для сохранения в зависимости от языка
    let descriptionIndex = -1;
    let columnName = '';
    
    if (language === 'en') {
      descriptionIndex = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "descriptionhtmlen" ||
          h?.toLowerCase() === "description_html_en"
      );
      columnName = 'DescriptionHTMLEN';
    } else if (language === 'kk') {
      descriptionIndex = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "descriptionhtmlkk" ||
          h?.toLowerCase() === "description_html_kk"
      );
      columnName = 'DescriptionHTMLKK';
    } else {
      // По умолчанию русский
      descriptionIndex = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "descriptionhtml" ||
          h?.toLowerCase() === "description_html" ||
          h?.toLowerCase() === "descriptionhtmlru" ||
          h?.toLowerCase() === "description_html_ru"
      );
      columnName = 'DescriptionHTML';
    }

    if (idIndex === -1) {
      throw new Error("Колонка 'ID' не найдена");
    }

    if (descriptionIndex === -1) {
      throw new Error(`Колонка '${columnName}' не найдена`);
    }

    // Находим строку с товаром
    let productRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idIndex]?.trim() === productId) {
        productRowIndex = i + 1; // +1 потому что в Sheets строки начинаются с 1
        break;
      }
    }

    if (productRowIndex === -1) {
      throw new Error(`Товар с ID "${productId}" не найден`);
    }

    // Обновляем описание в Google Sheets
    const descriptionRange = `${categorySheet.properties.title}!${String.fromCharCode(65 + descriptionIndex)}${productRowIndex}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: descriptionRange,
      valueInputOption: "RAW",
      resource: {
        values: [[description]],
      },
    });

    // Теперь обновляем весь каталог (регенерируем JSON)
    // Загружаем все категории
    const categoriesSheet = sheetsList.find(
      (s) => s.properties?.title?.toLowerCase() === "categories"
    );

    if (!categoriesSheet) {
      throw new Error("Лист 'Categories' не найден");
    }

    const categoriesRange = `${categoriesSheet.properties.title}!A:D`;
    const categoriesData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: categoriesRange,
    });

    const categoryRows = categoriesData.data.values || [];
    const categoryHeaders = categoryRows[0] || [];
    const idIdx = categoryHeaders.findIndex((h) => h?.toLowerCase() === "id" || h === "");
    const nameRUIdx = categoryHeaders.findIndex((h) => 
      h?.toLowerCase() === "name" || 
      h?.toLowerCase() === "nameru" || 
      h?.toLowerCase() === "name_ru"
    );
    
    const categories = [];
    for (let i = 1; i < categoryRows.length; i++) {
      const row = categoryRows[i];
      const id = row[idIdx]?.trim();
      const nameRU = row[nameRUIdx]?.trim() || row[1]?.trim();
      if (id && nameRU) {
        categories.push({
          id: id,
          nameRU: nameRU,
        });
      }
    }

    const result = {
      categories: [],
      products: {},
    };

    // Загружаем товары из каждого листа категории
    for (const category of categories) {
      const catSheet = sheetsList.find(
        (s) =>
          s.properties?.title?.toLowerCase() === category.id.toLowerCase()
      );

      if (!catSheet) {
        result.products[category.id] = [];
        continue;
      }

      const productsRange = `${catSheet.properties.title}!A:Z`;
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
      const idIdx = headers.findIndex((h) => h?.toLowerCase() === "id");
      const nameIdx = headers.findIndex((h) => h?.toLowerCase() === "name");
      const priceIdx = headers.findIndex((h) => h?.toLowerCase() === "price");
      const imagesIdx = headers.findIndex((h) => h?.toLowerCase() === "images");
      
      // Колонка documentation (JSON)
      const documentationIndex = headers.findIndex(
        (h) => h?.toLowerCase() === "documentation"
      );
      
      // Локализованные поля GeneralInfo
      const generalInfoRUIdx = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "generalinfo" ||
          h?.toLowerCase() === "general_info" ||
          h?.toLowerCase() === "generalinforu" ||
          h?.toLowerCase() === "general_info_ru"
      );
      const generalInfoENIdx = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "generalinfoen" ||
          h?.toLowerCase() === "general_info_en"
      );
      const generalInfoKKIdx = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "generalinfokk" ||
          h?.toLowerCase() === "general_info_kk"
      );
      
      // Локализованные поля DescriptionHTML
      const descRUIdx = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "descriptionhtml" ||
          h?.toLowerCase() === "description_html" ||
          h?.toLowerCase() === "descriptionhtmlru" ||
          h?.toLowerCase() === "description_html_ru"
      );
      const descENIdx = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "descriptionhtmlen" ||
          h?.toLowerCase() === "description_html_en"
      );
      const descKKIdx = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "descriptionhtmlkk" ||
          h?.toLowerCase() === "description_html_kk"
      );

      for (let i = 1; i < productRows.length; i++) {
        const row = productRows[i];
        if (!row[idIdx]) continue;

        const product = {
          id: row[idIdx]?.trim() || "",
          name: row[nameIdx]?.trim() || "",
          price: row[priceIdx]?.trim() || "",
          images: [],
          generalInfoRU: [],
          generalInfoEN: [],
          generalInfoKK: [],
          descriptionRU: "",
          descriptionEN: "",
          descriptionKK: "",
          documentation: null,
        };

        if (row[imagesIdx]) {
          try {
            product.images = JSON.parse(row[imagesIdx]);
          } catch (e) {
            product.images = row[imagesIdx]
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
            return row[index]
              .split("\n")
              .map((item) => item.trim())
              .filter((item) => item);
          }
        };

        product.generalInfoRU = parseGeneralInfo(generalInfoRUIdx);
        product.generalInfoEN = parseGeneralInfo(generalInfoENIdx);
        product.generalInfoKK = parseGeneralInfo(generalInfoKKIdx);
        
        if (product.generalInfoEN.length === 0) {
          product.generalInfoEN = product.generalInfoRU;
        }
        if (product.generalInfoKK.length === 0) {
          product.generalInfoKK = product.generalInfoRU;
        }

        product.descriptionRU = row[descRUIdx]?.trim() || "";
        product.descriptionEN = row[descENIdx]?.trim() || "";
        product.descriptionKK = row[descKKIdx]?.trim() || "";
        
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

    result.categories = categories;

    // Сохраняем обновленные JSON файлы
    const publicDataDir = join(process.cwd(), "public/data");
    if (!existsSync(publicDataDir)) {
      await mkdir(publicDataDir, { recursive: true });
    }

    const categoriesPath = join(publicDataDir, "categories.json");
    await writeFile(
      categoriesPath,
      JSON.stringify(result.categories, null, 2),
      "utf-8"
    );

    for (const category of result.categories) {
      // Имя файла генерируется автоматически: {id}.json
      const fileName = `${category.id}.json`;
      const categoryFilePath = join(publicDataDir, fileName);
      const products = result.products[category.id] || [];
      await writeFile(
        categoryFilePath,
        JSON.stringify(products, null, 2),
        "utf-8"
      );
    }

    return {
      success: true,
      message: "Описание успешно обновлено и каталог регенерирован",
    };
  } catch (error) {
    console.error("Error updating product description:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Ошибка при обновлении описания",
    });
  }
});
