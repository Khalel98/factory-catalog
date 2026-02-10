<template>
  <div class="html-content-editor">
    <div v-if="!hasContent" class="content-empty">
      <div class="empty-buttons" v-if="isAdmin">
        <button class="insert-html-button" @click="openHtmlDialog">
          &lt;/&gt; {{ t(`${translationKey}.insertHtml`) }}
        </button>
        <button class="edit-button" @click="openEditor">
          {{ t(`${translationKey}.edit`) }}
        </button>
      </div>
      <p v-else>{{ emptyMessage }}</p>
    </div>
    <div v-else>
      <div class="content-header">
        <div class="header-buttons" v-if="isAdmin">
          <button class="insert-html-button" @click="openHtmlDialog">
            &lt;/&gt; {{ t(`${translationKey}.insertHtml`) }}
          </button>
          <button class="edit-button" @click="openEditor">
            {{ t(`${translationKey}.edit`) }}
          </button>
        </div>
      </div>
      <div class="content-scroll-wrapper">
        <div class="content" v-html="getCurrentContent()"></div>
      </div>
    </div>

    <!-- Модальное окно редактора -->
    <ClientOnly>
      <Teleport to="body">
        <div v-if="isEditorOpen" class="editor-overlay" @click="closeEditor">
          <div class="editor-modal" @click.stop>
            <div class="editor-header">
              <h3>{{ t(`${translationKey}.editorTitle`) }}</h3>
              <div class="header-actions">
                <select
                  v-model="selectedLanguage"
                  @change="onLanguageChange"
                  class="language-selector"
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="kk">🇰🇿 Қазақша</option>
                </select>
                <button
                  v-if="
                    selectedLanguage !== 'ru' &&
                    contents.ru &&
                    contents.ru.trim()
                  "
                  class="translate-button"
                  @click="translateContent"
                  :disabled="isTranslating"
                  :title="t(`${translationKey}.translate`)"
                >
                  {{ isTranslating ? "⏳" : "🌐" }}
                  {{ t(`${translationKey}.translate`) }}
                </button>
                <button
                  class="table-button"
                  @click="insertTable"
                  :title="t(`${translationKey}.table`)"
                >
                  📊 {{ t(`${translationKey}.table`) }}
                </button>
                <button class="close-button" @click="closeEditor">×</button>
              </div>
            </div>
            <div class="editor-wrapper">
              <div ref="editorContainer" class="ckeditor-container"></div>
            </div>
            <div class="editor-actions">
              <button class="btn-cancel" @click="closeEditor">
                {{ t(`${translationKey}.cancel`) }}
              </button>
              <button class="btn-save" @click="saveContent">
                {{ t(`${translationKey}.save`) }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </ClientOnly>

    <!-- Модальное окно для вставки HTML -->
    <ClientOnly>
      <Teleport to="body">
        <div v-if="isHtmlDialogOpen" class="html-dialog-overlay" @click="closeHtmlDialog">
          <div class="html-dialog" @click.stop>
            <div class="html-dialog-header">
              <h3>{{ t(`${translationKey}.insertHtml`) }}</h3>
              <div class="header-actions">
                <select
                  v-model="htmlDialogLanguage"
                  class="language-selector"
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="kk">🇰🇿 Қазақша</option>
                </select>
                <button
                  v-if="
                    htmlDialogLanguage !== 'ru' &&
                    htmlToInsert &&
                    htmlToInsert.trim()
                  "
                  class="translate-button"
                  @click="translateHtml"
                  :disabled="isTranslatingHtml"
                  :title="t(`${translationKey}.translate`)"
                >
                  {{ isTranslatingHtml ? "⏳" : "🌐" }}
                  {{ t(`${translationKey}.translate`) }}
                </button>
                <button class="close-button" @click="closeHtmlDialog">×</button>
              </div>
            </div>
            <div class="html-dialog-content">
              <textarea
                v-model="htmlToInsert"
                class="html-textarea"
                placeholder="Вставьте HTML код..."
                rows="12"
              ></textarea>
            </div>
            <div class="html-dialog-actions">
              <button class="btn-cancel" @click="closeHtmlDialog">
                {{ t(`${translationKey}.cancel`) }}
              </button>
              <button class="btn-save" @click="insertHtmlToLanguage">
                {{ t(`${translationKey}.save`) }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, onUnmounted, watch, nextTick, toRaw } from "vue";

const { t, locale } = useI18n();

const props = defineProps({
  // Контент для отображения
  content: {
    type: String,
    default: "",
  },
  contentRU: {
    type: String,
    default: "",
  },
  contentKK: {
    type: String,
    default: "",
  },
  // ID продукта и категории для сохранения
  productId: {
    type: String,
    default: "",
  },
  categoryId: {
    type: String,
    default: "",
  },
  // API endpoint для сохранения
  apiEndpoint: {
    type: String,
    required: true,
  },
  // Ключ для переводов (например, "kit" или "priceComplectation")
  translationKey: {
    type: String,
    required: true,
  },
  // Placeholder для редактора
  placeholder: {
    type: String,
    default: "Введите контент...",
  },
  // Сообщение когда контент пустой
  emptyMessage: {
    type: String,
    default: "Контент будет добавлен позже",
  },
  // Имя поля для сохранения в API (например, "kit" или "priceComplectation")
  apiFieldName: {
    type: String,
    required: true,
  },
});

const isEditorOpen = ref(false);
const editorContainer = ref(null);
const ckeditorInstance = shallowRef(null);
const savedHtml = ref("");
const selectedLanguage = ref("ru");
const contents = ref({
  ru: "",
  kk: "",
});
const previousLanguage = ref("ru");
const isTranslating = ref(false);
const isHtmlDialogOpen = ref(false);
const htmlToInsert = ref("");
const htmlDialogLanguage = ref("ru");
const isTranslatingHtml = ref(false);

// Проверка, является ли пользователь админом
const isAdmin = computed(() => {
  if (process.client) {
    return localStorage.getItem("isAdmin") === "true";
  }
  return false;
});

const hasContent = computed(() => {
  return (
    savedHtml.value ||
    (props.content && props.content.trim() !== "") ||
    (props.contentRU && props.contentRU.trim() !== "") ||
    (props.contentKK && props.contentKK.trim() !== "")
  );
});

// Функция для получения текущего контента в зависимости от языка интерфейса
const getCurrentContent = () => {
  let raw = "";
  // Если есть savedHtml (после редактирования), используем его
  if (savedHtml.value) {
    raw = savedHtml.value;
  } else {
    // Иначе используем контент в зависимости от текущего языка интерфейса
    const currentLang = locale.value;
    if (currentLang === "kk" && props.contentKK) {
      raw = props.contentKK;
    } else {
      raw = props.contentRU || props.content || "";
    }
  }
  return replaceContentRootUrl(raw);
};

// Функция для обновления контента из пропсов
const updateContentsFromProps = () => {
  // Извлекаем примитивные значения из пропсов и сохраняем как обычные строки
  const contentRUValue = props.contentRU;
  const contentKKValue = props.contentKK;
  
  contents.value.ru = contentRUValue ? String(contentRUValue) : "";
  contents.value.kk = contentKKValue ? String(contentKKValue) : "";

  // Если есть общий контент, используем его для текущего языка, если для него нет отдельного
  if (props.content) {
    const contentValue = String(props.content);
    const currentLang = locale.value;
    if (
      !contents.value[currentLang] ||
      contents.value[currentLang].trim() === ""
    ) {
      contents.value[currentLang] = contentValue;
    }
  }
  
  const currentContent = contents.value[locale.value];
  savedHtml.value = currentContent ? String(currentContent) : "";
};

// Инициализация контента при монтировании
onMounted(() => {
  updateContentsFromProps();
});

// Отслеживание изменений контента в пропсах
watch(
  () => [
    props.contentRU,
    props.contentKK,
    props.content,
  ],
  () => {
    updateContentsFromProps();
  },
  { immediate: true }
);

// Отслеживание изменения языка интерфейса для обновления отображаемого контента
watch(
  () => locale.value,
  () => {
    // Обновляем savedHtml при смене языка интерфейса
    savedHtml.value = contents.value[locale.value] || "";
  }
);

// Замена корневого адреса ссылок: pharmec.by → gazservice7.kz
const CONTENT_ROOT_URL_OLD = "https://pharmec.by";
const CONTENT_ROOT_URL_NEW = "https://gazservice7.kz";

const replaceContentRootUrl = (html) => {
  if (!html || typeof html !== "string") return html;
  return html.split(CONTENT_ROOT_URL_OLD).join(CONTENT_ROOT_URL_NEW);
};

// Функция для очистки HTML от оберток figure вокруг таблиц
const cleanHtmlFromFigureWrappers = (html) => {
  if (!html) return "";
  
  // Удаляем <figure class="table"> обертки вокруг таблиц
  let cleaned = String(html);
  
  // Удаляем открывающий <figure class="table"> перед таблицей
  cleaned = cleaned.replace(/<figure[^>]*class=["']table["'][^>]*>\s*<table/gi, '<table');
  
  // Удаляем закрывающий </figure> после таблицы
  cleaned = cleaned.replace(/<\/table>\s*<\/figure>/gi, '</table>');
  
  // Также обрабатываем случаи с другими атрибутами figure
  cleaned = cleaned.replace(/<figure[^>]*>\s*<table/gi, '<table');
  cleaned = cleaned.replace(/<\/table>\s*<\/figure>/gi, '</table>');
  
  return cleaned;
};

const insertTable = () => {
  const editor = toRaw(ckeditorInstance.value);
  if (!editor) return;

  try {
    // Используем встроенную команду insertTable CKEditor 5
    // Вставляем таблицу 2x2 через команду
    editor.execute('insertTable', {
      rows: 2,
      columns: 2,
      headingRows: 1
    });
  } catch (error) {
    console.error("Ошибка при вставке таблицы:", error);
    // Альтернативный способ: вставляем HTML напрямую
    try {
      if (editor.getData) {
        const currentContent = String(editor.getData() || "");
        const tableHTML = `
          <table>
            <thead>
              <tr>
                <th>Заголовок 1</th>
                <th>Заголовок 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ячейка 1</td>
                <td>Ячейка 2</td>
              </tr>
              <tr>
                <td>Ячейка 3</td>
                <td>Ячейка 4</td>
              </tr>
            </tbody>
          </table>
        `;
        editor.setData(currentContent + tableHTML);
      }
    } catch (e) {
      console.error("Ошибка при альтернативной вставке таблицы:", e);
    }
  }
};

const openHtmlDialog = () => {
  htmlDialogLanguage.value = locale.value || "ru";
  
  // Загружаем существующий HTML для выбранного языка
  let existingHtml = contents.value[htmlDialogLanguage.value] || "";
  
  // Если в contents нет, пытаемся взять из пропсов
  if (!existingHtml || existingHtml.trim() === "") {
    if (htmlDialogLanguage.value === "ru") {
      existingHtml = props.contentRU || "";
    } else if (htmlDialogLanguage.value === "kk") {
      existingHtml = props.contentKK || "";
    }
    
    // Если нашли в пропсах, обновляем contents
    if (existingHtml && existingHtml.trim()) {
      contents.value[htmlDialogLanguage.value] = existingHtml;
    }
  }
  
  htmlToInsert.value = existingHtml || "";
  isHtmlDialogOpen.value = true;
};

const closeHtmlDialog = () => {
  isHtmlDialogOpen.value = false;
  htmlToInsert.value = "";
  htmlDialogLanguage.value = "ru";
  isTranslatingHtml.value = false;
};

const translateHtml = async () => {
  if (!htmlToInsert.value || !htmlToInsert.value.trim()) {
    alert("Сначала введите HTML код для перевода");
    return;
  }

  if (htmlDialogLanguage.value === "ru") {
    alert("Выберите другой язык для перевода");
    return;
  }

  isTranslatingHtml.value = true;

  try {
    const response = await $fetch("/api/translate", {
      method: "POST",
      body: {
        text: htmlToInsert.value,
        fromLang: "ru",
        toLang: htmlDialogLanguage.value,
      },
    });

    if (response.success && response.translatedText) {
      htmlToInsert.value = response.translatedText;
      alert(
        "✅ HTML переведен! Вы можете отредактировать код перед вставкой."
      );
    } else {
      throw new Error("Перевод не выполнен");
    }
  } catch (error) {
    console.error("Ошибка при переводе HTML:", error);
    alert(
      `❌ Ошибка при переводе: ${
        error.data?.message || error.message || "Неизвестная ошибка"
      }`
    );
  } finally {
    isTranslatingHtml.value = false;
  }
};

const insertHtmlToLanguage = async () => {
  if (!htmlToInsert.value || !htmlToInsert.value.trim()) {
    alert("Введите HTML код для вставки");
    return;
  }

  // Заменяем корневой адрес ссылок на актуальный перед сохранением
  let htmlContent = replaceContentRootUrl(htmlToInsert.value.trim());

  // Сохраняем напрямую в Google Sheets
  try {
    // Обновляем contents для выбранного языка
    contents.value[htmlDialogLanguage.value] = htmlContent;

    // Если есть productId и categoryId, сохраняем в Google Sheets
    if (props.productId && props.categoryId) {
      try {
        const body = {
          productId: props.productId,
          categoryId: props.categoryId,
          [props.apiFieldName]: htmlContent,
          language: htmlDialogLanguage.value,
        };

        const response = await $fetch(props.apiEndpoint, {
          method: "POST",
          body,
        });

        if (response.success) {
          alert(`✅ HTML успешно вставлен и сохранен в Google Sheets!`);
          // Обновляем отображаемый контент
          savedHtml.value = htmlContent;
          // Перезагружаем страницу для получения актуальных данных
          window.location.reload();
        }
      } catch (error) {
        console.error("Ошибка при сохранении HTML:", error);
        alert(
          `❌ ${t(`${props.translationKey}.error`)} ${error.data?.message || error.message}`
        );
      }
    } else {
      // Если нет productId/categoryId, сохраняем локально
      contents.value[htmlDialogLanguage.value] = htmlContent;
      savedHtml.value = htmlContent;
      alert(t(`${props.translationKey}.savedLocal`));
    }

    closeHtmlDialog();
  } catch (error) {
    console.error("Ошибка при вставке HTML:", error);
    alert("Ошибка при вставке HTML: " + (error.message || error));
  }
};

const openEditor = async () => {
  // Проверяем, что мы на клиенте
  if (process.server) return;

  // Обновляем контент из пропсов перед открытием редактора
  updateContentsFromProps();

  // Устанавливаем выбранный язык на текущий язык интерфейса
  selectedLanguage.value = locale.value;
  previousLanguage.value = locale.value;

  isEditorOpen.value = true;
  await nextTick();

  if (editorContainer.value && !ckeditorInstance.value) {
    // Динамический импорт CKEditor 5 только на клиенте
    const { default: ClassicEditor } = await import("@ckeditor/ckeditor5-build-classic");
    
    // Создаем экземпляр редактора
    ckeditorInstance.value = await ClassicEditor.create(editorContainer.value, {
      toolbar: [
        "heading",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "bulletedList",
        "numberedList",
        "|",
        "alignment",
        "|",
        "link",
        "insertTable",
        "|",
        "undo",
        "redo",
      ],
      heading: {
        options: [
          { model: "paragraph", title: "Параграф", class: "ck-heading_paragraph" },
          { model: "heading1", view: "h1", title: "Заголовок 1", class: "ck-heading_heading1" },
          { model: "heading2", view: "h2", title: "Заголовок 2", class: "ck-heading_heading2" },
          { model: "heading3", view: "h3", title: "Заголовок 3", class: "ck-heading_heading3" },
        ],
      },
      placeholder: props.placeholder,
      table: {
        contentToolbar: [
          "tableColumn",
          "tableRow",
          "mergeTableCells",
        ],
      },
    });
  }

  // Загружаем контент для выбранного языка (после создания редактора или если он уже существует)
  // Увеличиваем задержку, чтобы редактор точно был готов
  await nextTick();
  setTimeout(() => {
    if (ckeditorInstance.value) {
      // Извлекаем язык как примитивное значение
      const lang = String(selectedLanguage.value);
      loadContentForLanguage(lang);
    }
  }, 300);
};

const loadContentForLanguage = (lang) => {
  if (!ckeditorInstance.value) return;

  // Извлекаем примитивные значения из реактивных объектов
  let content = "";
  
  // Сначала пытаемся взять из contents
  const contentsValue = contents.value[lang];
  if (contentsValue && typeof contentsValue === 'string') {
    content = contentsValue;
  } else if (contentsValue) {
    // Если это не строка, преобразуем
    content = String(contentsValue);
  }

  // Если контент пустой, пытаемся взять из пропсов напрямую
  if (!content || content.trim() === "") {
    if (lang === "ru") {
      const propValue = props.contentRU;
      content = propValue ? String(propValue) : "";
    } else if (lang === "kk") {
      const propValue = props.contentKK;
      content = propValue ? String(propValue) : "";
    }
    
    // Обновляем contents для будущего использования (сохраняем как обычную строку)
    if (content && content.trim()) {
      contents.value[lang] = content;
    }
  }

  // Финальное преобразование в обычную строку (гарантированно не реактивную)
  let contentString = content ? String(content) : "";
  
  // Очищаем от оберток figure вокруг таблиц при загрузке (если они есть)
  contentString = cleanHtmlFromFigureWrappers(contentString);
  // Заменяем корневой адрес ссылок на актуальный
  contentString = replaceContentRootUrl(contentString);

  if (!contentString || contentString.trim() === "") {
    console.log(`loadContentForLanguage(${lang}): контент пустой`);
    // Используем setTimeout для асинхронной установки, чтобы избежать конфликтов
    setTimeout(() => {
      try {
        const editor = toRaw(ckeditorInstance.value);
        if (editor && editor.setData) {
          editor.setData("");
        }
      } catch (error) {
        console.error(`Ошибка при очистке редактора:`, error);
      }
    }, 0);
    return;
  }

  console.log(
    `loadContentForLanguage(${lang}): длина контента = ${contentString.length} символов`
  );

  // Используем setTimeout для асинхронной установки данных
  // Это гарантирует, что редактор полностью инициализирован
  setTimeout(() => {
    try {
      const editor = toRaw(ckeditorInstance.value);
      if (editor && editor.setData) {
        // Создаем новую строку из примитивного значения, чтобы гарантировать отсутствие реактивности
        const cleanString = contentString.slice(0);
        editor.setData(cleanString);
        console.log(`loadContentForLanguage(${lang}): контент успешно загружен`);
      }
    } catch (error) {
      console.error(`Ошибка при загрузке контента для языка ${lang}:`, error);
      // Попытка восстановления - очищаем редактор
      try {
        const editor = toRaw(ckeditorInstance.value);
        if (editor && editor.setData) {
          editor.setData("");
        }
      } catch (e) {
        console.error("Не удалось очистить редактор после ошибки:", e);
      }
    }
  }, 50);
};

const onLanguageChange = () => {
  const editor = toRaw(ckeditorInstance.value);
  if (!editor || !editor.getData) return;

  try {
    // Сохраняем текущий контент редактора для предыдущего языка
    const currentContent = editor.getData();
    // Преобразуем в обычную строку и создаем копию
    const contentString = currentContent ? String(currentContent).slice(0) : "";
    const prevLang = String(previousLanguage.value);
    contents.value[prevLang] = contentString;

    // Обновляем предыдущий язык на новый выбранный (извлекаем примитивное значение)
    const newLang = String(selectedLanguage.value);
    previousLanguage.value = newLang;

    // Загружаем контент для нового языка из contents (который может быть обновлен из пропсов)
    loadContentForLanguage(newLang);
  } catch (error) {
    console.error("Ошибка при смене языка:", error);
  }
};

// Функция перевода контента
const translateContent = async () => {
  if (
    !ckeditorInstance.value ||
    !contents.value.ru ||
    !contents.value.ru.trim()
  ) {
    alert("Сначала создайте контент на русском языке");
    return;
  }

  if (selectedLanguage.value === "ru") {
    alert("Выберите другой язык для перевода");
    return;
  }

  // Проверяем, есть ли уже перевод
  if (
    contents.value[selectedLanguage.value] &&
    contents.value[selectedLanguage.value].trim()
  ) {
    const confirmOverwrite = confirm(
      `Уже есть перевод на ${
        "казахский"
      }. Перевести заново?`
    );
    if (!confirmOverwrite) {
      return;
    }
  }

  isTranslating.value = true;

  try {
    const response = await $fetch("/api/translate", {
      method: "POST",
      body: {
        text: contents.value.ru,
        fromLang: "ru",
        toLang: selectedLanguage.value,
      },
    });

    if (response.success && response.translatedText) {
      // Загружаем переведенный текст в редактор
      contents.value[selectedLanguage.value] = response.translatedText;
      await loadContentForLanguage(selectedLanguage.value);
      alert(
        "✅ Перевод выполнен! Вы можете отредактировать текст перед сохранением."
      );
    } else {
      throw new Error("Перевод не выполнен");
    }
  } catch (error) {
    console.error("Ошибка при переводе:", error);
    alert(
      `❌ Ошибка при переводе: ${
        error.data?.message || error.message || "Неизвестная ошибка"
      }`
    );
  } finally {
    isTranslating.value = false;
  }
};

const saveContent = async () => {
  const editor = toRaw(ckeditorInstance.value);
  if (!editor || !editor.getData) return;

  try {
    // Сохраняем контент для текущего выбранного языка перед сохранением
    const htmlContent = editor.getData();
    // Преобразуем в обычную строку и создаем копию
    let htmlContentString = htmlContent ? String(htmlContent).slice(0) : "";
    
    // Очищаем от оберток figure вокруг таблиц
    htmlContentString = cleanHtmlFromFigureWrappers(htmlContentString);
    // Заменяем корневой адрес ссылок на актуальный
    htmlContentString = replaceContentRootUrl(htmlContentString);

    const currentLang = String(selectedLanguage.value);
    contents.value[currentLang] = htmlContentString;
    savedHtml.value = htmlContentString;

  // Если есть productId и categoryId, сохраняем в Google Sheets
  if (props.productId && props.categoryId) {
    try {
      const body = {
        productId: props.productId,
        categoryId: props.categoryId,
        [props.apiFieldName]: htmlContentString,
        language: currentLang,
      };

      const response = await $fetch(props.apiEndpoint, {
        method: "POST",
        body,
      });

      if (response.success) {
        alert(`✅ ${t(`${props.translationKey}.saved`)}`);
        // Обновляем контент из пропсов после сохранения (перед перезагрузкой)
        // Но лучше перезагрузить страницу, чтобы получить актуальные данные
        window.location.reload();
      }
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert(
        `❌ ${t(`${props.translationKey}.error`)} ${error.data?.message || error.message}`
      );
    }
  } else {
    // Если нет productId/categoryId, выводим в консоль (старый способ)
    const jsonOutput = JSON.stringify(htmlContentString, null, 2);
    console.log("=".repeat(60));
    console.log("СОХРАНЕННЫЙ HTML ДЛЯ JSON:");
    console.log("=".repeat(60));
    console.log(jsonOutput);
    console.log("=".repeat(60));
    alert(t(`${props.translationKey}.savedLocal`));
  }
  } catch (error) {
    console.error("Ошибка при сохранении контента:", error);
    alert(`❌ ${t(`${props.translationKey}.error`)} ${error.message || "Неизвестная ошибка"}`);
  }

  closeEditor();
};

// Закрытие по Escape
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      if (isHtmlDialogOpen.value) {
        closeHtmlDialog();
      } else if (isEditorOpen.value) {
        closeEditor();
      }
    }
  };
  document.addEventListener("keydown", handleEscape);

  onUnmounted(() => {
    document.removeEventListener("keydown", handleEscape);
  });
});

// Сохраняем контент при закрытии редактора
const closeEditor = async () => {
  const editor = toRaw(ckeditorInstance.value);
  if (editor) {
    try {
      // Сохраняем текущий контент перед уничтожением
      if (editor.getData) {
        const currentContent = editor.getData();
        // Преобразуем в обычную строку и создаем копию
        const contentString = currentContent ? String(currentContent).slice(0) : "";
        const currentLang = String(selectedLanguage.value);
        contents.value[currentLang] = contentString;
      }
    } catch (error) {
      console.error("Ошибка при сохранении контента при закрытии:", error);
    }
    
    try {
      // Уничтожаем экземпляр редактора
      if (editor.destroy) {
        await editor.destroy();
      }
    } catch (error) {
      console.error("Ошибка при уничтожении редактора:", error);
    } finally {
      ckeditorInstance.value = null;
    }
  }
  isEditorOpen.value = false;
};
</script>

<style scoped>
.html-content-editor {
  font-size: 1rem;
  line-height: 1.8;
  color: #52606d;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
}


.content-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.header-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.insert-html-button {
  padding: 8px 16px;
  background: #9c27b0;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.insert-html-button:hover {
  background: #7b1fa2;
  transform: translateY(-1px);
}

.empty-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.empty-buttons .insert-html-button {
  padding: 12px 24px;
  font-size: 1rem;
}

.edit-button {
  padding: 8px 16px;
  background: #1e88e5;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-button:hover {
  background: #1565c0;
  transform: translateY(-1px);
}

.content-scroll-wrapper {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
}

.content {
  line-height: 1.8;
}

.content :deep(h1),
.content :deep(h2),
.content :deep(h3) {
  margin: 16px 0 8px 0;
  font-weight: 700;
}

.content :deep(p) {
  margin: 8px 0;
}

.content :deep(ul),
.content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.content :deep(a) {
  color: #1e88e5;
  text-decoration: none;
}

.content :deep(a:hover) {
  text-decoration: underline;
}

.content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  border: 1px solid #e5e7eb;
}

.content :deep(table th) {
  background: transparent !important;
  border: 1px solid #e5e7eb;
  padding: 12px;
  font-weight: 600;
  text-align: left;
  color: #1f2933;
}

.content :deep(table thead th) {
  background: transparent !important;
}

.content :deep(table tbody th) {
  background: transparent !important;
}

.content :deep(table tbody tr:nth-child(even)) {
  background: #f5f5f5;
}

.content :deep(table tbody tr:nth-child(even) td) {
  background: #f5f5f5;
}

.content :deep(table tbody tr:nth-child(even) th) {
  background: #f5f5f5 !important;
}

.content :deep(table tbody tr:hover) {
  background: #f9fafb;
}

.content :deep(table tbody tr:hover td) {
  background: #f9fafb;
}

.content :deep(table tbody tr:hover th) {
  background: #f9fafb !important;
}

.content :deep(table td) {
  border: 1px solid #e5e7eb;
  padding: 12px;
  color: #52606d;
}

.content :deep(table tr:hover) {
  background: #f9fafb;
}

.content-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  gap: 20px;
}

.content-empty p {
  color: #9ca3af;
  font-style: italic;
}

.content-empty .edit-button {
  padding: 12px 24px;
  font-size: 1rem;
}

.editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.editor-modal {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.language-selector {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  background: white;
  color: #1f2933;
  cursor: pointer;
  transition: all 0.2s ease;
}

.table-button {
  padding: 8px 16px;
  background: #4caf50;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.table-button:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.translate-button {
  padding: 8px 16px;
  background: #2196f3;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.translate-button:hover:not(:disabled) {
  background: #1976d2;
  transform: translateY(-1px);
}

.translate-button:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
  opacity: 0.7;
}

.editor-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2933;
}

.close-button {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #52606d;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #e5e7eb;
  color: #1f2933;
}

.editor-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding: 24px;
  min-height: 400px;
  background: #ffffff;
}

.ckeditor-container {
  min-height: 500px;
}

/* Стили для CKEditor 5 */
.ckeditor-container :deep(.ck-editor__editable) {
  min-height: 500px;
}

.ckeditor-container :deep(.ck-content) {
  min-height: 500px;
}

/* Стили для таблиц в редакторе CKEditor */
.ckeditor-container :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  border: 1px solid #d1d5db;
  table-layout: auto;
  word-wrap: break-word;
  display: table;
  box-sizing: border-box;
}

.ckeditor-container :deep(table th),
.ckeditor-container :deep(table td) {
  border: 1px solid #d1d5db;
  padding: 10px 12px;
  text-align: left;
  vertical-align: top;
  min-width: 100px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
  position: relative;
}

.ckeditor-container :deep(table th) {
  background: #f3f4f6;
  font-weight: 600;
  color: #1f2933;
}

.ckeditor-container :deep(table td) {
  background: #ffffff;
  color: #374151;
}

.ckeditor-container :deep(table tbody tr:nth-child(even) td) {
  background: #f9fafb;
}

.ckeditor-container :deep(table tbody tr:hover td) {
  background: #f3f4f6;
}

/* Улучшаем отображение вложенных элементов в таблицах */
.ckeditor-container :deep(table p) {
  margin: 0;
  padding: 0;
  line-height: 1.5;
}

.ckeditor-container :deep(table sub),
.ckeditor-container :deep(table sup) {
  font-size: 0.75em;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

.ckeditor-container :deep(table sub) {
  bottom: -0.25em;
}

.ckeditor-container :deep(table sup) {
  top: -0.5em;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-save {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f5f5f5;
  color: #52606d;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  background: #1e88e5;
  color: #ffffff;
}

.btn-save:hover {
  background: #1565c0;
  transform: translateY(-1px);
}

.html-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.html-dialog {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.html-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.html-dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2933;
}

.html-dialog-header .header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.html-dialog-content {
  padding: 24px;
}

.html-textarea {
  width: 100%;
  min-height: 300px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.html-textarea:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.html-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .html-content-editor {
    min-width: 0;
    width: 100%;
    overflow: hidden;
  }

  .content-scroll-wrapper {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
  }

  .content {
    display: inline-block;
    min-width: 100%;
  }

  .content :deep(table) {
    min-width: max-content;
    width: max-content;
    table-layout: auto;
  }

  .editor-modal {
    max-width: 100%;
    max-height: 95vh;
  }

  .editor-wrapper {
    padding: 16px;
    min-height: 300px;
    overflow-x: auto;
    min-width: 0;
  }

  .ckeditor-container {
    min-width: 0;
    overflow-x: auto;
  }

  .ckeditor-container :deep(.ck-editor__editable),
  .ckeditor-container :deep(.ck-content) {
    overflow-x: auto;
  }

  .html-dialog {
    max-width: 100%;
  }
}
</style>
