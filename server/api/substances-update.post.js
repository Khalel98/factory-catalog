import { google } from "googleapis";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const substances = body?.substances;

  if (!Array.isArray(substances)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Требуется массив substances",
    });
  }

  try {
    const credentialsPath = join(process.cwd(), "google-sheets-credentials.json");
    const credentialsData = await readFile(credentialsPath, "utf-8");
    const config = JSON.parse(credentialsData);
    const spreadsheetId = config.spreadsheet_id || "";

    if (!config.client_email || !config.private_key || !spreadsheetId) {
      throw new Error("Google Sheets credentials not configured");
    }

    let privateKey = config.private_key.trim();
    if (privateKey.includes("\\n") && !privateKey.includes("\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }
    if (privateKey.includes("\\\\n")) {
      privateKey = privateKey.replace(/\\\\n/g, "\n");
    }

    const auth = new google.auth.JWT({
      email: config.client_email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetsList = spreadsheetInfo.data.sheets || [];
    let substancesSheet = sheetsList.find((s) => s.properties?.title?.toLowerCase() === "substances");

    const rows = [
      ["id", "name", "nameKz", "description", "descriptionKz", "productIds"],
      ...substances.map((s) => [
        s.id || "",
        s.name || "",
        s.nameKz || "",
        s.description || "",
        s.descriptionKz || "",
        Array.isArray(s.productIds) ? s.productIds.join(", ") : "",
      ]),
    ];

    if (substancesSheet) {
      const range = `Substances!A1:F${rows.length}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: { values: rows },
      });
    } else {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "Substances" },
              },
            },
          ],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Substances!A1:F" + rows.length,
        valueInputOption: "RAW",
        requestBody: { values: rows },
      });
    }

    const publicDataDir = join(process.cwd(), "public/data");
    if (!existsSync(publicDataDir)) {
      await mkdir(publicDataDir, { recursive: true });
    }
    const normalized = substances.map((s) => ({
      id: s.id || "",
      name: s.name || "",
      nameKz: s.nameKz || "",
      description: s.description || "",
      descriptionKz: s.descriptionKz || "",
      productIds: Array.isArray(s.productIds) ? s.productIds : [],
    }));
    await writeFile(
      join(publicDataDir, "substances.json"),
      JSON.stringify(normalized, null, 2),
      "utf-8"
    );

    return {
      success: true,
      message: "Вещества успешно обновлены",
      count: normalized.length,
    };
  } catch (error) {
    console.error("Error updating substances:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Ошибка при обновлении веществ",
    });
  }
});
