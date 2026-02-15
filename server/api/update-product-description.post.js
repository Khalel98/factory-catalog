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
    
    if (language === 'kk') {
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
      const descKKIdx = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "descriptionhtmlkk" ||
          h?.toLowerCase() === "description_html_kk"
      );
      
      // Локализованные поля KitHTML
      const kitRUIdx = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return (
            lower === "kitru" ||
            lower === "kithtmlru" ||
            lower === "kit_html_ru" ||
            lower === "kithtml" ||
            lower === "kit_html"
          );
        }
      );
      const kitKKIdx = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return lower === "kitkk" || lower === "kithtmlkk" || lower === "kit_html_kk";
        }
      );
      
      // JSON поля
      // videos (JSON) - структура с заголовком и списком видео
      const videosIndex = headers.findIndex(
        (h) => h?.toLowerCase() === "videos"
      );
      
      // Дополнительные поля
      // priceComplectation (текст/HTML) - информация о ценах и комплектации
      const priceComplectationRUIndex = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return (
            lower === "pricecomplectationru" ||
            lower === "price_complectation_ru" ||
            lower === "pricecomplectation_ru" ||
            lower === "pricecomplectation" ||
            lower === "price_complectation"
          );
        }
      );
      const priceComplectationKKIndex = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return (
            lower === "pricecomplectationkk" ||
            lower === "price_complectation_kk" ||
            lower === "pricecomplectation_kk"
          );
        }
      );
      
      // specifications (текст/HTML) - технические характеристики
      const specificationsRUIndex = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return (
            lower === "specificationsru" ||
            lower === "specifications_ru" ||
            lower === "specifications" ||
            lower === "specification"
          );
        }
      );
      const specificationsKKIndex = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return (
            lower === "specificationskk" ||
            lower === "specifications_kk"
          );
        }
      );
      
      // compatibility (JSON массив ID) - совместимое оборудование
      const compatibilityIndex = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return (
            lower === "compatibility" ||
            lower === "compatibleproducts" ||
            lower === "compatible_products" ||
            lower === "compatibleproductids" ||
            lower === "compatible_product_ids"
          );
        }
      );

      // priceComplectationCategories (JSON)
      const priceComplectationCategoriesIndex = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return (
            lower === "pricecomplectationcategories" ||
            lower === "price_complectation_categories"
          );
        }
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
          generalInfoKK: [],
          descriptionRU: "",
          descriptionKK: "",
          kitRU: "",
          kitKK: "",
          documentation: null,
          videos: null,
          priceComplectationRU: "",
          priceComplectationKK: "",
          priceComplectationInfo: "",
          specificationsRU: "",
          specificationsKK: "",
          specificationsInfo: "",
          compatibility: [],
          priceComplectationCategories: [],
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
        product.generalInfoKK = parseGeneralInfo(generalInfoKKIdx);
        
        if (product.generalInfoKK.length === 0) {
          product.generalInfoKK = product.generalInfoRU;
        }

        product.descriptionRU = row[descRUIdx]?.trim() || "";
        product.descriptionKK = row[descKKIdx]?.trim() || "";
        
        if (!product.descriptionKK) {
          product.descriptionKK = product.descriptionRU;
        }

        // Kit для каждого языка
        product.kitRU = row[kitRUIdx]?.trim() || "";
        product.kitKK = row[kitKKIdx]?.trim() || "";
        
        // Если нет локализованных полей kit, используем русские для всех
        if (!product.kitKK && product.kitRU) {
          product.kitKK = product.kitRU;
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

        // Парсим videos (JSON)
        if (videosIndex !== -1 && row[videosIndex]) {
          try {
            product.videos = JSON.parse(row[videosIndex]);
          } catch (e) {
            console.warn(`Ошибка парсинга videos для продукта ${product.id}:`, e);
            product.videos = null;
          }
        }

        // PriceComplectation (текст/HTML) - локализованные поля
        if (priceComplectationRUIndex !== -1 && row[priceComplectationRUIndex]) {
          product.priceComplectationRU = row[priceComplectationRUIndex]?.trim() || "";
        }
        if (priceComplectationKKIndex !== -1 && row[priceComplectationKKIndex]) {
          product.priceComplectationKK = row[priceComplectationKKIndex]?.trim() || "";
        }
        
        // Используем RU по умолчанию для обратной совместимости
        product.priceComplectationInfo = product.priceComplectationRU || product.priceComplectationKK || "";

        // Specifications (текст/HTML) - локализованные поля
        if (specificationsRUIndex !== -1 && row[specificationsRUIndex]) {
          product.specificationsRU = row[specificationsRUIndex]?.trim() || "";
        }
        if (specificationsKKIndex !== -1 && row[specificationsKKIndex]) {
          product.specificationsKK = row[specificationsKKIndex]?.trim() || "";
        }
        
        // Используем RU по умолчанию для обратной совместимости
        product.specificationsInfo = product.specificationsRU || product.specificationsKK || "";

        // Парсим compatibility (JSON массив ID)
        if (compatibilityIndex !== -1 && row[compatibilityIndex]) {
          try {
            const compatibilityData = JSON.parse(row[compatibilityIndex]);
            product.compatibility = Array.isArray(compatibilityData) 
              ? compatibilityData.map(id => String(id).trim()).filter(id => id)
              : [];
          } catch (e) {
            // Если не JSON, пытаемся парсить как строку с разделителями
            const compatibilityStr = row[compatibilityIndex].trim();
            if (compatibilityStr) {
              product.compatibility = compatibilityStr
                .split(/[,\s]+/)
                .map(id => id.trim())
                .filter(id => id);
            }
          }
        }

        // Парсим priceComplectationCategories (JSON)
        if (priceComplectationCategoriesIndex !== -1 && row[priceComplectationCategoriesIndex]) {
          try {
            const data = JSON.parse(row[priceComplectationCategoriesIndex]);
            product.priceComplectationCategories = Array.isArray(data)
              ? data.map((cat) => ({
                  name: String(cat?.name ?? "").trim(),
                  productIds: Array.isArray(cat?.productIds)
                    ? cat.productIds.map((id) => String(id).trim()).filter(Boolean)
                    : [],
                })).filter((cat) => cat.name || cat.productIds.length > 0)
              : [];
          } catch (e) {
            product.priceComplectationCategories = [];
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
