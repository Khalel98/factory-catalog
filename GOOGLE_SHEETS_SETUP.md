# Настройка Google Sheets API

## Шаг 1: Создание проекта в Google Cloud Console

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. В верхней части страницы нажмите на выпадающий список проектов (рядом с логотипом Google Cloud)
3. Нажмите **"NEW PROJECT"** (Новый проект)
4. Введите название проекта (например, "factory-catalog")
5. Нажмите **"CREATE"**

## Шаг 2: Включение Google Sheets API

1. В поисковой строке вверху страницы введите **"Google Sheets API"**
2. Выберите **"Google Sheets API"** из результатов
3. Нажмите кнопку **"ENABLE"** (Включить)

## Шаг 3: Создание сервисного аккаунта

### Вариант 1: Через поиск
1. В поисковой строке вверху страницы введите **"Service Accounts"**
2. Выберите **"Service Accounts"** из результатов
3. Нажмите **"CREATE SERVICE ACCOUNT"** (Создать сервисный аккаунт)

### Вариант 2: Через меню
1. В левом меню найдите раздел **"IAM & Admin"** (или просто **"IAM"**)
2. Нажмите на **"Service Accounts"**
3. Нажмите **"CREATE SERVICE ACCOUNT"** (Создать сервисный аккаунт)

### Вариант 3: Прямая ссылка
Перейдите по адресу: `https://console.cloud.google.com/iam-admin/serviceaccounts`

## Шаг 4: Настройка сервисного аккаунта

1. **Service account name**: Введите имя (например, "sheets-reader")
2. **Service account ID**: Будет создан автоматически
3. Нажмите **"CREATE AND CONTINUE"**

4. **Grant this service account access to project** (Опционально):
   - Роль: **"Editor"** или **"Viewer"** (в зависимости от того, нужно ли редактировать таблицы)
   - Нажмите **"CONTINUE"**

5. Нажмите **"DONE"**

## Шаг 5: Создание ключа

1. Найдите созданный сервисный аккаунт в списке
2. Нажмите на email сервисного аккаунта (например, `sheets-reader@your-project.iam.gserviceaccount.com`)
3. Перейдите на вкладку **"KEYS"** (Ключи)
4. Нажмите **"ADD KEY"** → **"Create new key"**
5. Выберите формат **JSON**
6. Нажмите **"CREATE"**
7. Файл JSON автоматически скачается на ваш компьютер

## Шаг 6: Предоставление доступа к Google Sheets

1. Откройте вашу Google Таблицу
2. Нажмите кнопку **"Share"** (Поделиться) в правом верхнем углу
3. Вставьте email сервисного аккаунта (например, `sheets-reader@your-project.iam.gserviceaccount.com`)
4. Выберите права доступа: **"Editor"** (если нужно редактировать) или **"Viewer"** (если только чтение)
5. **ВАЖНО**: Снимите галочку **"Notify people"** (чтобы не отправлять уведомление)
6. Нажмите **"Send"**

## Шаг 7: Настройка файла credentials

1. Откройте скачанный JSON файл
2. Добавьте в него поле `spreadsheet_id` с ID вашей таблицы:
   ```json
   {
     "type": "service_account",
     "project_id": "...",
     "private_key_id": "...",
     "private_key": "...",
     "client_email": "...",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "...",
     "universe_domain": "googleapis.com",
     "spreadsheet_id": "ВАШ_ID_ТАБЛИЦЫ"
   }
   ```

3. **Как найти ID таблицы:**
   - Откройте вашу Google Таблицу в браузере
   - Посмотрите на URL: `https://docs.google.com/spreadsheets/d/ID_ТАБЛИЦЫ/edit`
   - Скопируйте `ID_ТАБЛИЦЫ` из URL

4. Сохраните файл как `google-sheets-credentials.json` в корне проекта

## Шаг 8: Проверка

1. Убедитесь, что файл `google-sheets-credentials.json` находится в корне проекта
2. Убедитесь, что файл добавлен в `.gitignore` (чтобы не попасть в Git)
3. Попробуйте обновить каталог через интерфейс сайта

## Важные замечания

⚠️ **НИКОГДА не загружайте `google-sheets-credentials.json` в Git!**
- Файл уже добавлен в `.gitignore`
- Если файл уже был залит в Git, нужно:
  1. Удалить ключ в Google Cloud Console
  2. Создать новый ключ
  3. Удалить файл из истории Git (если возможно)

## Решение проблем

### Ошибка "Invalid JWT Signature"
- Ключ был скомпрометирован или удален
- Создайте новый ключ в Google Cloud Console
- Обновите `google-sheets-credentials.json`

### Ошибка "The caller does not have permission"
- Убедитесь, что сервисный аккаунт имеет доступ к таблице (см. Шаг 6)
- Убедитесь, что Google Sheets API включен в проекте

### Проект не найден
- Убедитесь, что выбран правильный проект в Google Cloud Console
- Проверьте `project_id` в файле credentials
