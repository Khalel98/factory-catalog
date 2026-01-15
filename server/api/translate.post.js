/**
 * API endpoint для перевода текста
 * Использует Google Translate API через googleapis
 * Бесплатный лимит: 500,000 символов в месяц
 * 
 * Для работы нужно:
 * 1. Включить Cloud Translation API в Google Cloud Console
 * 2. Использовать те же credentials, что и для Google Sheets
 */

import { google } from "googleapis";
import { readFile } from "fs/promises";
import { join } from "path";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { text, fromLang = 'ru', toLang = 'en' } = body;

    if (!text || !text.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Текст для перевода не указан",
      });
    }

    // Поддерживаемые языки
    const supportedLangs = {
      ru: 'ru',
      en: 'en',
      kk: 'kk', // Казахский
    };

    if (!supportedLangs[fromLang] || !supportedLangs[toLang]) {
      throw createError({
        statusCode: 400,
        statusMessage: `Неподдерживаемый язык. Поддерживаются: ru, en, kk`,
      });
    }

    if (fromLang === toLang) {
      return {
        success: true,
        translatedText: text,
        fromLang,
        toLang,
      };
    }

    // Загружаем credentials для Google Translate API
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

    // Исправляем форматирование private_key
    let privateKey = credentials.private_key.trim();
    if (privateKey.includes("\\n") && !privateKey.includes("\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }
    if (privateKey.includes("\\\\n")) {
      privateKey = privateKey.replace(/\\\\n/g, "\n");
    }

    // Настраиваем аутентификацию для Google Translate API
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/cloud-translation"],
    });

    // Маппинг языков для Google Translate API
    const langMap = {
      ru: 'ru',
      en: 'en',
      kk: 'kk', // Google Translate поддерживает казахский
    };

    const fromLangCode = langMap[fromLang];
    const toLangCode = langMap[toLang];

    // Функция для перевода текста через Google Translate API v2 REST API
    const translateText = async (textToTranslate, from = fromLangCode, to = toLangCode) => {
      try {
        // Получаем access token
        const accessToken = await auth.getAccessToken();
        
        // Используем REST API напрямую с Bearer токеном
        const requestBody = {
          q: textToTranslate,
          source: from,
          target: to,
          format: 'html' // Сохраняем HTML форматирование
        };

        const response = await fetch(
          `https://translation.googleapis.com/language/translate/v2`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (data.data && data.data.translations && data.data.translations.length > 0) {
          return data.data.translations[0].translatedText;
        } else {
          throw new Error('Неверный формат ответа от Google Translate API');
        }
      } catch (error) {
        console.error('Ошибка Google Translate API:', error);
        throw error;
      }
    };

    // Google Translate API автоматически сохраняет HTML структуру
    // Просто передаем весь текст с HTML, API сам переведет только текстовое содержимое
    let translatedText;
    
    try {
      translatedText = await translateText(text, fromLangCode, toLangCode);
    } catch (error) {
      console.error('Ошибка перевода:', error);
      // Если ошибка связана с отсутствием API, предлагаем включить его
      if (error.message && error.message.includes('API has not been used')) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Cloud Translation API не включен. Включите его в Google Cloud Console: https://console.cloud.google.com/apis/library/translate.googleapis.com',
        });
      }
      throw error;
    }

    return {
      success: true,
      translatedText,
      fromLang,
      toLang,
    };
  } catch (error) {
    console.error('Ошибка при переводе:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Ошибка при переводе текста',
    });
  }
});
