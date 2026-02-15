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
    
    // Убираем лишние пробелы в начале и конце
    privateKey = privateKey.trim();
    
    // Обрабатываем различные форматы экранирования
    // Если ключ содержит буквальные \n (не настоящие переносы строк)
    if (privateKey.includes("\\n") && !privateKey.includes("\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }
    
    // Если ключ содержит двойные экранированные \\n
    if (privateKey.includes("\\\\n")) {
      privateKey = privateKey.replace(/\\\\n/g, "\n");
    }

    // Проверяем формат ключа
    if (!privateKey.includes("BEGIN PRIVATE KEY") && !privateKey.includes("BEGIN RSA PRIVATE KEY")) {
      throw new Error("Private key format error: missing BEGIN PRIVATE KEY or BEGIN RSA PRIVATE KEY");
    }
    if (!privateKey.includes("END PRIVATE KEY") && !privateKey.includes("END RSA PRIVATE KEY")) {
      throw new Error("Private key format error: missing END PRIVATE KEY or END RSA PRIVATE KEY");
    }

    // Настраиваем аутентификацию
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Проверяем аутентификацию с улучшенной обработкой ошибок
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
    const categoriesRange = `${categoriesSheet.properties.title}!A:Z`;
    const categoriesData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: categoriesRange,
    });

    const rows = categoriesData.data.values || [];
    const headers = rows[0] || [];
    
    // Определяем индексы колонок
    // Сначала ищем точные совпадения (nameru, nameen, namekk), потом fallback на name
    const idIndex = headers.findIndex((h) => h?.toLowerCase() === "id" || h === "");
    
    // Ищем NameRU - сначала точное совпадение, потом fallback на Name
    let nameRUIndex = headers.findIndex((h) => {
      const lower = h?.toLowerCase();
      return lower === "nameru" || lower === "name_ru";
    });
    if (nameRUIndex === -1) {
      nameRUIndex = headers.findIndex((h) => h?.toLowerCase() === "name");
    }
    
    // Ищем NameKK
    const nameKKIndex = headers.findIndex((h) => {
      const lower = h?.toLowerCase();
      return lower === "namekk" || lower === "name_kk";
    });
    
    // Ищем ParentID для поддержки подкатегорий
    const parentIdIndex = headers.findIndex((h) => {
      const lower = h?.toLowerCase();
      return lower === "parentid" || lower === "parent_id" || lower === "parentcategory" || lower === "parent_category";
    });
    
    // Пропускаем заголовок
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const id = row[idIndex]?.trim();
      const nameRU = row[nameRUIndex]?.trim() || row[1]?.trim();
      const nameKK = row[nameKKIndex]?.trim() || "";
      const parentId = parentIdIndex !== -1 ? (row[parentIdIndex]?.trim() || null) : null;
      
      if (id && nameRU) {
        const category = {
          id: id,
          nameRU: nameRU,
          nameKK: nameKK || nameRU, // Если нет перевода, используем русское
        };
        
        // Добавляем parentId только если он указан (не пустая строка)
        if (parentId) {
          category.parentId = parentId;
        }
        
        result.categories.push(category);
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

      // Читаем все колонки до AZ (включая PriceComplectationCategories и др.)
      const productsRange = `${categorySheet.properties.title}!A:AZ`;
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
      
      // ==========================================
      // ОБЯЗАТЕЛЬНЫЕ ПОЛЯ
      // ==========================================
      const idIndex = headers.findIndex((h) => h?.toLowerCase() === "id");
      const nameIndex = headers.findIndex((h) => h?.toLowerCase() === "name");
      const priceIndex = headers.findIndex(
        (h) => h?.toLowerCase() === "price"
      );
      const imagesIndex = headers.findIndex(
        (h) => h?.toLowerCase() === "images"
      );
      
      // ==========================================
      // ЛОКАЛИЗОВАННЫЕ ПОЛЯ: GeneralInfo
      // Поддерживаемые названия колонок:
      // - GeneralInfoRU, GeneralInfoEN, GeneralInfoKK
      // - GeneralInfo, General_Info, GeneralInfoRU, GeneralInfoEN, GeneralInfoKK
      // ==========================================
      
      // Локализованные поля GeneralInfo
      const generalInfoRUIndex = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "generalinfo" ||
          h?.toLowerCase() === "general_info" ||
          h?.toLowerCase() === "generalinforu" ||
          h?.toLowerCase() === "general_info_ru"
      );
      const generalInfoKKIndex = headers.findIndex(
        (h) =>
          h?.toLowerCase() === "generalinfokk" ||
          h?.toLowerCase() === "general_info_kk"
      );
      
      // ==========================================
      // ЛОКАЛИЗОВАННЫЕ ПОЛЯ: DescriptionHTML
      // Поддерживаемые названия колонок:
      // - DescriptionHTMLRU, DescriptionHTMLEN, DescriptionHTMLKK (приоритет)
      // - DescriptionHTML, Description_HTML (fallback для RU)
      // ==========================================
      let descriptionRUIndex = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return lower === "descriptionhtmlru" || lower === "description_html_ru";
        }
      );
      // Если не нашли специфичную, ищем общую
      if (descriptionRUIndex === -1) {
        descriptionRUIndex = headers.findIndex(
          (h) => {
            const lower = h?.toLowerCase() || "";
            return lower === "descriptionhtml" || lower === "description_html";
          }
        );
      }
      
      const descriptionKKIndex = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return lower === "descriptionhtmlkk" || lower === "description_html_kk";
        }
      );
      
      // ==========================================
      // ЛОКАЛИЗОВАННЫЕ ПОЛЯ: KitHTML
      // Поддерживаемые названия колонок:
      // - KitRU, KitEN, KitKK (приоритет)
      // - KitHTMLRU, KitHTMLEN, KitHTMLKK
      // - KitHTML, Kit_HTML (fallback для RU)
      // ==========================================
      const kitRUIndex = headers.findIndex(
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
      const kitKKIndex = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return lower === "kitkk" || lower === "kithtmlkk" || lower === "kit_html_kk";
        }
      );
      
      // ==========================================
      // JSON ПОЛЯ
      // ==========================================
      // documentation (JSON) - структура с блоками документов
      const documentationIndex = headers.findIndex(
        (h) => h?.toLowerCase() === "documentation"
      );
      
      // videos (JSON) - структура с заголовком и списком видео
      const videosIndex = headers.findIndex(
        (h) => h?.toLowerCase() === "videos"
      );
      
      // ==========================================
      // ДОПОЛНИТЕЛЬНЫЕ ПОЛЯ
      // ==========================================
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
            lower === "specifications_kk" ||
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

      // priceComplectationCategories (JSON) - категории с ID товаров для вкладки «Цены и комплектация»
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
        if (!row[idIndex]) continue; // Пропускаем пустые строки

        // ==========================================
        // СОЗДАНИЕ ОБЪЕКТА ПРОДУКТА СО ВСЕМИ ПОЛЯМИ
        // Все поля из Google Sheets синхронизируются здесь
        // ==========================================
        const product = {
          // Обязательные поля
          id: row[idIndex]?.trim() || "",
          name: row[nameIndex]?.trim() || "",
          price: row[priceIndex]?.trim() || "",
          images: [],
          
          // Локализованные поля: GeneralInfo
          generalInfoRU: [],
          generalInfoKK: [],
          
          // Локализованные поля: DescriptionHTML
          descriptionRU: "",
          descriptionKK: "",
          
          // Локализованные поля: KitHTML
          kitRU: "",
          kitKK: "",
          
          // JSON поля
          documentation: null,
          videos: null,
          
          // Дополнительные поля
          priceComplectationRU: "",
          priceComplectationKK: "",
          priceComplectationInfo: "",
          specificationsRU: "",
          specificationsKK: "",
          specificationsInfo: "",
          compatibility: [],
          priceComplectationCategories: [],
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
        product.generalInfoKK = parseGeneralInfo(generalInfoKKIndex);
        
        // Если нет локализованных полей, используем русские для всех
        if (product.generalInfoKK.length === 0) {
          product.generalInfoKK = product.generalInfoRU;
        }

        // Описания для каждого языка
        product.descriptionRU = row[descriptionRUIndex]?.trim() || "";
        product.descriptionKK = row[descriptionKKIndex]?.trim() || "";
        
        // Если нет локализованных полей, используем русские для всех
        if (!product.descriptionKK) {
          product.descriptionKK = product.descriptionRU;
        }

        // Kit для каждого языка
        product.kitRU = row[kitRUIndex]?.trim() || "";
        product.kitKK = row[kitKKIndex]?.trim() || "";
        
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

        // Парсим priceComplectationCategories (JSON: массив { name, productIds })
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
