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
    
    // Ищем NameEN
    const nameENIndex = headers.findIndex((h) => {
      const lower = h?.toLowerCase();
      return lower === "nameen" || lower === "name_en";
    });
    
    // Ищем NameKK
    const nameKKIndex = headers.findIndex((h) => {
      const lower = h?.toLowerCase();
      return lower === "namekk" || lower === "name_kk";
    });
    
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

      // Читаем все колонки до Z (можно расширить до AA, AB и т.д. если нужно)
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
      
      const descriptionENIndex = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return lower === "descriptionhtmlen" || lower === "description_html_en";
        }
      );
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
      const kitENIndex = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return lower === "kiten" || lower === "kithtmlen" || lower === "kit_html_en";
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
      const priceComplectationIndex = headers.findIndex(
        (h) => {
          const lower = h?.toLowerCase() || "";
          return (
            lower === "pricecomplectation" ||
            lower === "price_complectation" ||
            lower === "pricecomplectationinfo" ||
            lower === "price_complectation_info"
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
          generalInfoEN: [],
          generalInfoKK: [],
          
          // Локализованные поля: DescriptionHTML
          descriptionRU: "",
          descriptionEN: "",
          descriptionKK: "",
          
          // Локализованные поля: KitHTML
          kitRU: "",
          kitEN: "",
          kitKK: "",
          
          // JSON поля
          documentation: null,
          videos: null,
          
          // Дополнительные поля
          priceComplectationInfo: "",
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

        // Kit для каждого языка
        product.kitRU = row[kitRUIndex]?.trim() || "";
        product.kitEN = row[kitENIndex]?.trim() || "";
        product.kitKK = row[kitKKIndex]?.trim() || "";
        
        // Если нет локализованных полей kit, используем русские для всех
        if (!product.kitEN && product.kitRU) {
          product.kitEN = product.kitRU;
        }
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

        // PriceComplectation (текст/HTML)
        if (priceComplectationIndex !== -1 && row[priceComplectationIndex]) {
          product.priceComplectationInfo = row[priceComplectationIndex]?.trim() || "";
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
