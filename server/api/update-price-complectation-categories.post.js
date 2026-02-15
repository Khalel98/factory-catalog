import { google } from "googleapis";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/** Буква колонки по 0-based индексу (0=A, 25=Z, 26=AA) */
function getColumnLetter(index) {
  let s = "";
  let n = index;
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { productId, categoryId, priceComplectationCategories } = body;

    if (!productId || !categoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Необходимы productId и categoryId",
      });
    }

    const normalized = Array.isArray(priceComplectationCategories)
      ? priceComplectationCategories.map((cat) => ({
          name: String(cat?.name ?? "").trim(),
          productIds: Array.isArray(cat?.productIds)
            ? cat.productIds.map((id) => String(id).trim()).filter(Boolean)
            : [],
        })).filter((cat) => cat.name || (cat.productIds && cat.productIds.length > 0))
      : [];

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

    let privateKey = credentials.private_key.trim();
    if (privateKey.includes("\\n") && !privateKey.includes("\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }
    if (privateKey.includes("\\\\n")) {
      privateKey = privateKey.replace(/\\\\n/g, "\n");
    }

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
          "Ошибка аутентификации Google: Invalid JWT Signature. Скачайте новый JSON ключ из Google Cloud Console и обновите google-sheets-credentials.json"
        );
      }
      throw authError;
    }
    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    const sheetsList = spreadsheetInfo.data.sheets || [];

    const categorySheet = sheetsList.find(
      (s) => s.properties?.title?.toLowerCase() === categoryId.toLowerCase()
    );
    if (!categorySheet) {
      throw new Error(`Лист категории "${categoryId}" не найден`);
    }

    // Читаем с запасом колонок, чтобы при добавлении новой колонки в конец она попала в диапазон
    const productsRange = `${categorySheet.properties.title}!A:AZ`;
    const productsData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: productsRange,
    });
    const rows = productsData.data.values || [];
    if (rows.length < 2) {
      throw new Error("Нет данных в листе");
    }

    const headers = rows[0] || [];
    const idIndex = headers.findIndex((h) => h?.toLowerCase() === "id");

    let priceComplectationCategoriesColIndex = headers.findIndex(
      (h) =>
        h?.toLowerCase() === "pricecomplectationcategories" ||
        h?.toLowerCase() === "price_complectation_categories"
    );

    if (priceComplectationCategoriesColIndex === -1) {
      priceComplectationCategoriesColIndex = headers.length;
      const columnLetter = getColumnLetter(priceComplectationCategoriesColIndex);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${categorySheet.properties.title}!${columnLetter}1`,
        valueInputOption: "RAW",
        resource: {
          values: [["PriceComplectationCategories"]],
        },
      });
    }

    if (idIndex === -1) {
      throw new Error("Колонка 'ID' не найдена");
    }

    let productRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idIndex]?.trim() === String(productId)) {
        productRowIndex = i + 1;
        break;
      }
    }
    if (productRowIndex === -1) {
      throw new Error(`Товар с ID "${productId}" не найден`);
    }

    const valueToWrite = JSON.stringify(normalized);
    const columnLetter = getColumnLetter(priceComplectationCategoriesColIndex);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${categorySheet.properties.title}!${columnLetter}${productRowIndex}`,
      valueInputOption: "RAW",
      resource: {
        values: [[valueToWrite]],
      },
    });

    // Регенерация каталога (аналогично update-compatibility)
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
        categories.push({ id, nameRU });
      }
    }

    const result = { categories: [], products: {} };

    for (const category of categories) {
      const catSheet = sheetsList.find(
        (s) => s.properties?.title?.toLowerCase() === category.id.toLowerCase()
      );
      if (!catSheet) {
        result.products[category.id] = [];
        continue;
      }

      const range = `${catSheet.properties.title}!A:AZ`;
      const data = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      const productRows = data.data.values || [];
      if (productRows.length < 2) {
        result.products[category.id] = [];
        continue;
      }

      const headersRow = productRows[0] || [];
      const idIdxH = headersRow.findIndex((h) => h?.toLowerCase() === "id");
      const nameIdx = headersRow.findIndex((h) => h?.toLowerCase() === "name");
      const priceIdx = headersRow.findIndex((h) => h?.toLowerCase() === "price");
      const imagesIdx = headersRow.findIndex((h) => h?.toLowerCase() === "images");
      const compatibilityIdx = headersRow.findIndex(
        (h) =>
          h?.toLowerCase() === "compatibility" ||
          h?.toLowerCase() === "compatible_products" ||
          h?.toLowerCase() === "compatibleproductids"
      );
      const documentationIndex = headersRow.findIndex((h) => h?.toLowerCase() === "documentation");
      const generalInfoRUIdx = headersRow.findIndex(
        (h) =>
          h?.toLowerCase() === "generalinfo" ||
          h?.toLowerCase() === "generalinforu" ||
          h?.toLowerCase() === "general_info_ru"
      );
      const generalInfoKKIdx = headersRow.findIndex(
        (h) => h?.toLowerCase() === "generalinfokk" || h?.toLowerCase() === "general_info_kk"
      );
      const descRUIdx = headersRow.findIndex(
        (h) =>
          h?.toLowerCase() === "descriptionhtml" ||
          h?.toLowerCase() === "descriptionhtmlru" ||
          h?.toLowerCase() === "description_html_ru"
      );
      const descKKIdx = headersRow.findIndex(
        (h) => h?.toLowerCase() === "descriptionhtmlkk" || h?.toLowerCase() === "description_html_kk"
      );
      const kitRUIdx = headersRow.findIndex(
        (h) => {
          const l = h?.toLowerCase() || "";
          return l === "kitru" || l === "kithtmlru" || l === "kit_html_ru" || l === "kithtml" || l === "kit_html";
        }
      );
      const kitKKIdx = headersRow.findIndex(
        (h) => (h?.toLowerCase() || "").includes("kitkk") || (h?.toLowerCase() || "").includes("kit_kk")
      );
      const videosIndex = headersRow.findIndex((h) => h?.toLowerCase() === "videos");
      const priceComplectationRUIndex = headersRow.findIndex(
        (h) => {
          const l = h?.toLowerCase() || "";
          return l === "pricecomplectationru" || l === "price_complectation_ru" || l === "pricecomplectation" || l === "price_complectation";
        }
      );
      const priceComplectationKKIndex = headersRow.findIndex(
        (h) => {
          const l = h?.toLowerCase() || "";
          return l === "pricecomplectationkk" || l === "price_complectation_kk";
        }
      );
      const specificationsRUIndex = headersRow.findIndex(
        (h) => {
          const l = h?.toLowerCase() || "";
          return l === "specificationsru" || l === "specifications_ru" || l === "specifications";
        }
      );
      const specificationsKKIndex = headersRow.findIndex(
        (h) => (h?.toLowerCase() || "").includes("specificationskk") || (h?.toLowerCase() || "").includes("specifications_kk")
      );
      const priceComplectationCategoriesIndex = headersRow.findIndex(
        (h) =>
          h?.toLowerCase() === "pricecomplectationcategories" ||
          h?.toLowerCase() === "price_complectation_categories"
      );

      const products = [];
      const parseGeneralInfo = (index, row) => {
        if (index === -1 || !row[index]) return [];
        try {
          return JSON.parse(row[index]);
        } catch (e) {
          return String(row[index])
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      };

      for (let i = 1; i < productRows.length; i++) {
        const row = productRows[i];
        if (!row[idIdxH]) continue;

        const product = {
          id: row[idIdxH]?.trim() || "",
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
            product.images = String(row[imagesIdx])
              .split(",")
              .map((img) => img.trim())
              .filter(Boolean);
          }
        }

        product.generalInfoRU = parseGeneralInfo(generalInfoRUIdx, row);
        product.generalInfoKK = parseGeneralInfo(generalInfoKKIdx, row);
        if (product.generalInfoKK.length === 0) product.generalInfoKK = product.generalInfoRU;

        product.descriptionRU = row[descRUIdx]?.trim() || "";
        product.descriptionKK = row[descKKIdx]?.trim() || "";
        if (!product.descriptionKK) product.descriptionKK = product.descriptionRU;

        product.kitRU = row[kitRUIdx]?.trim() || "";
        product.kitKK = row[kitKKIdx]?.trim() || "";
        if (!product.kitKK) product.kitKK = product.kitRU;

        if (documentationIndex !== -1 && row[documentationIndex]) {
          try {
            product.documentation = JSON.parse(row[documentationIndex]);
          } catch (e) {
            product.documentation = null;
          }
        }
        if (videosIndex !== -1 && row[videosIndex]) {
          try {
            product.videos = JSON.parse(row[videosIndex]);
          } catch (e) {
            product.videos = null;
          }
        }

        if (priceComplectationRUIndex !== -1 && row[priceComplectationRUIndex]) {
          product.priceComplectationRU = row[priceComplectationRUIndex]?.trim() || "";
        }
        if (priceComplectationKKIndex !== -1 && row[priceComplectationKKIndex]) {
          product.priceComplectationKK = row[priceComplectationKKIndex]?.trim() || "";
        }
        product.priceComplectationInfo = product.priceComplectationRU || product.priceComplectationKK || "";

        if (specificationsRUIndex !== -1 && row[specificationsRUIndex]) {
          product.specificationsRU = row[specificationsRUIndex]?.trim() || "";
        }
        if (specificationsKKIndex !== -1 && row[specificationsKKIndex]) {
          product.specificationsKK = row[specificationsKKIndex]?.trim() || "";
        }
        product.specificationsInfo = product.specificationsRU || product.specificationsKK || "";

        if (compatibilityIdx !== -1 && row[compatibilityIdx]) {
          try {
            const data = JSON.parse(row[compatibilityIdx]);
            product.compatibility = Array.isArray(data)
              ? data.map((id) => String(id).trim()).filter(Boolean)
              : [];
          } catch (e) {
            const str = String(row[compatibilityIdx]).trim();
            if (str) {
              product.compatibility = str.split(/[,\s]+/).map((id) => id.trim()).filter(Boolean);
            }
          }
        }

        if (priceComplectationCategoriesIndex !== -1 && row[priceComplectationCategoriesIndex]) {
          try {
            const data = JSON.parse(row[priceComplectationCategoriesIndex]);
            product.priceComplectationCategories = Array.isArray(data)
              ? data.map((cat) => ({
                  name: String(cat?.name ?? "").trim(),
                  productIds: Array.isArray(cat?.productIds)
                    ? cat.productIds.map((id) => String(id).trim()).filter(Boolean)
                    : [],
                })).filter((cat) => cat.name || (cat.productIds && cat.productIds.length > 0))
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

    const publicDataDir = join(process.cwd(), "public/data");
    if (!existsSync(publicDataDir)) {
      await mkdir(publicDataDir, { recursive: true });
    }
    await writeFile(
      join(publicDataDir, "categories.json"),
      JSON.stringify(result.categories, null, 2),
      "utf-8"
    );
    for (const category of result.categories) {
      const fileName = `${category.id}.json`;
      const products = result.products[category.id] || [];
      await writeFile(
        join(publicDataDir, fileName),
        JSON.stringify(products, null, 2),
        "utf-8"
      );
    }

    return {
      success: true,
      message: "Категории цен и комплектации сохранены, каталог обновлён",
    };
  } catch (error) {
    console.error("Error updating price complectation categories:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Ошибка при сохранении категорий цен и комплектации",
    });
  }
});
