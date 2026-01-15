<template>
  <div class="tab-panel">
    <div v-if="!hasDescription" class="description-empty">
      <button v-if="isAdmin" class="edit-button" @click="openEditor">
        {{ t("description.edit") }}
      </button>
    </div>
    <div v-else>
      <div class="description-header">
        <button v-if="isAdmin" class="edit-button" @click="openEditor">
          {{ t("description.edit") }}
        </button>
      </div>
      <div class="description-content" v-html="getCurrentDescription()"></div>
    </div>

    <!-- Модальное окно редактора -->
    <ClientOnly>
      <Teleport to="body">
        <div v-if="isEditorOpen" class="editor-overlay" @click="closeEditor">
          <div class="editor-modal" @click.stop>
            <div class="editor-header">
              <h3>{{ t("description.editorTitle") }}</h3>
              <div class="header-actions">
                <select
                  v-model="selectedLanguage"
                  @change="onLanguageChange"
                  class="language-selector"
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="kk">🇰🇿 Қазақша</option>
                </select>
                <button
                  v-if="
                    selectedLanguage !== 'ru' &&
                    descriptions.ru &&
                    descriptions.ru.trim()
                  "
                  class="translate-button"
                  @click="translateDescription"
                  :disabled="isTranslating"
                  :title="t('description.translate')"
                >
                  {{ isTranslating ? "⏳" : "🌐" }}
                  {{ t("description.translate") }}
                </button>
                <button
                  class="table-button"
                  @click="insertTable"
                  :title="t('description.table')"
                >
                  📊 {{ t("description.table") }}
                </button>
                <button class="close-button" @click="closeEditor">×</button>
              </div>
            </div>
            <div class="editor-wrapper">
              <div ref="editorContainer" class="quill-editor"></div>
            </div>
            <div class="editor-actions">
              <button class="btn-cancel" @click="closeEditor">
                {{ t("description.cancel") }}
              </button>
              <button class="btn-save" @click="saveContent">
                {{ t("description.save") }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";

const { t, locale } = useI18n();

const props = defineProps({
  description: {
    type: String,
    default: "",
  },
  descriptionRU: {
    type: String,
    default: "",
  },
  descriptionEN: {
    type: String,
    default: "",
  },
  descriptionKK: {
    type: String,
    default: "",
  },
  productId: {
    type: String,
    default: "",
  },
  categoryId: {
    type: String,
    default: "",
  },
});

const isEditorOpen = ref(false);
const editorContainer = ref(null);
const quillEditor = ref(null);
const savedHtml = ref("");
const selectedLanguage = ref("ru");
const descriptions = ref({
  ru: "",
  en: "",
  kk: "",
});
const previousLanguage = ref("ru");
const isTranslating = ref(false);

// Проверка, является ли пользователь админом
const isAdmin = computed(() => {
  if (process.client) {
    return localStorage.getItem("isAdmin") === "true";
  }
  return false;
});

const hasDescription = computed(() => {
  return (
    savedHtml.value ||
    (props.description && props.description.trim() !== "") ||
    (props.descriptionRU && props.descriptionRU.trim() !== "") ||
    (props.descriptionEN && props.descriptionEN.trim() !== "") ||
    (props.descriptionKK && props.descriptionKK.trim() !== "")
  );
});

// Функция для получения текущего описания в зависимости от языка интерфейса
const getCurrentDescription = () => {
  // Если есть savedHtml (после редактирования), используем его
  if (savedHtml.value) {
    return savedHtml.value;
  }

  // Иначе используем описание в зависимости от текущего языка интерфейса
  const currentLang = locale.value;
  if (currentLang === "en" && props.descriptionEN) {
    return props.descriptionEN;
  }
  if (currentLang === "kk" && props.descriptionKK) {
    return props.descriptionKK;
  }
  // По умолчанию русское
  return props.descriptionRU || props.description || "";
};

// Функция для обновления описаний из пропсов
const updateDescriptionsFromProps = () => {
  descriptions.value.ru = props.descriptionRU || "";
  descriptions.value.en = props.descriptionEN || "";
  descriptions.value.kk = props.descriptionKK || "";

  // Логируем для отладки
  console.log("updateDescriptionsFromProps:", {
    ru: descriptions.value.ru.substring(0, 50),
    en: descriptions.value.en.substring(0, 50),
    kk: descriptions.value.kk.substring(0, 50),
    propsEN: props.descriptionEN?.substring(0, 50),
  });

  // Если есть общее описание, используем его для текущего языка, если для него нет отдельного
  if (props.description) {
    const currentLang = locale.value;
    if (
      !descriptions.value[currentLang] ||
      descriptions.value[currentLang].trim() === ""
    ) {
      descriptions.value[currentLang] = props.description;
    }
  }
  savedHtml.value = descriptions.value[locale.value] || "";
};

// Инициализация описаний при монтировании
onMounted(() => {
  updateDescriptionsFromProps();
});

// Отслеживание изменений описаний в пропсах
watch(
  () => [
    props.descriptionRU,
    props.descriptionEN,
    props.descriptionKK,
    props.description,
  ],
  () => {
    updateDescriptionsFromProps();
  },
  { immediate: true }
);

// Отслеживание изменения языка интерфейса для обновления отображаемого описания
watch(
  () => locale.value,
  () => {
    // Обновляем savedHtml при смене языка интерфейса
    savedHtml.value = descriptions.value[locale.value] || "";
  }
);

const insertTable = () => {
  if (!quillEditor.value) return;

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

  const range = quillEditor.value.getSelection(true);
  if (range) {
    quillEditor.value.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
  } else {
    quillEditor.value.clipboard.dangerouslyPasteHTML(tableHTML);
  }
};

const openEditor = async () => {
  // Проверяем, что мы на клиенте
  if (process.server) return;

  // Обновляем описания из пропсов перед открытием редактора
  updateDescriptionsFromProps();

  // Устанавливаем выбранный язык на текущий язык интерфейса
  selectedLanguage.value = locale.value;
  previousLanguage.value = locale.value;

  isEditorOpen.value = true;
  await nextTick();

  if (editorContainer.value && !quillEditor.value) {
    // Динамический импорт Quill только на клиенте
    const Quill = (await import("quill")).default;
    await import("quill/dist/quill.snow.css");

    // Импортируем модуль для таблиц
    const QuillBetterTable = (await import("quill-better-table")).default;
    Quill.register(
      {
        "modules/better-table": QuillBetterTable,
      },
      true
    );

    quillEditor.value = new Quill(editorContainer.value, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          [{ font: [] }],
          [{ size: [] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link", "image"],
          ["clean"],
        ],
        "better-table": {
          operationMenu: {
            items: {
              unmergeCells: {
                text: "Объединить ячейки",
              },
            },
          },
        },
        keyboard: {
          bindings: QuillBetterTable.keyboardBindings,
        },
      },
      placeholder: "Введите описание товара...",
      readOnly: false,
    });

    // Оптимизация производительности - дебаунс для обновлений
    let textChangeTimer = null;
    quillEditor.value.on("text-change", () => {
      if (textChangeTimer) {
        clearTimeout(textChangeTimer);
      }
    });

    // Отключаем лишние события для улучшения производительности
    quillEditor.value.root.addEventListener(
      "input",
      (e) => {
        e.stopPropagation();
      },
      { passive: true }
    );
  }

  // Загружаем контент для выбранного языка (после создания редактора или если он уже существует)
  await nextTick();
  setTimeout(() => {
    if (quillEditor.value) {
      loadContentForLanguage(selectedLanguage.value);
    }
  }, 150);
};

const loadContentForLanguage = (lang) => {
  if (!quillEditor.value) return;

  // Берем контент напрямую из пропсов, если в descriptions его нет
  let content = descriptions.value[lang] || "";

  // Если контент пустой, пытаемся взять из пропсов напрямую
  if (!content || content.trim() === "") {
    if (lang === "ru") {
      content = props.descriptionRU || "";
    } else if (lang === "en") {
      content = props.descriptionEN || "";
    } else if (lang === "kk") {
      content = props.descriptionKK || "";
    }
    // Обновляем descriptions для будущего использования
    if (content) {
      descriptions.value[lang] = content;
    }
  }

  if (!content || content.trim() === "") {
    console.log(`loadContentForLanguage(${lang}): контент пустой`);
    return;
  }

  console.log(
    `loadContentForLanguage(${lang}): длина контента = ${content.length} символов`
  );

  try {
    // Используем clipboard.dangerouslyPasteHTML для правильной загрузки HTML в Quill
    // Сначала очищаем редактор
    quillEditor.value.setText("");

    // Затем вставляем HTML контент
    const delta = quillEditor.value.clipboard.convert({ html: content });
    quillEditor.value.setContents(delta, "silent");

    console.log(`loadContentForLanguage(${lang}): контент успешно загружен`);
  } catch (error) {
    console.error(`Ошибка при загрузке контента для языка ${lang}:`, error);
    // Fallback: используем innerHTML напрямую
    try {
      quillEditor.value.root.innerHTML = content;
    } catch (e) {
      console.error(`Ошибка при использовании innerHTML:`, e);
    }
  }
};

const onLanguageChange = () => {
  if (!quillEditor.value) return;

  // Сохраняем текущий контент редактора для предыдущего языка
  const currentContent = quillEditor.value.root.innerHTML;
  descriptions.value[previousLanguage.value] = currentContent;

  // Обновляем предыдущий язык на новый выбранный
  previousLanguage.value = selectedLanguage.value;

  // Загружаем контент для нового языка из descriptions (который может быть обновлен из пропсов)
  loadContentForLanguage(selectedLanguage.value);
};

// Функция перевода описания
const translateDescription = async () => {
  if (
    !quillEditor.value ||
    !descriptions.value.ru ||
    !descriptions.value.ru.trim()
  ) {
    alert("Сначала создайте описание на русском языке");
    return;
  }

  if (selectedLanguage.value === "ru") {
    alert("Выберите другой язык для перевода");
    return;
  }

  // Проверяем, есть ли уже перевод
  if (
    descriptions.value[selectedLanguage.value] &&
    descriptions.value[selectedLanguage.value].trim()
  ) {
    const confirmOverwrite = confirm(
      `Уже есть перевод на ${
        selectedLanguage.value === "en" ? "английский" : "казахский"
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
        text: descriptions.value.ru,
        fromLang: "ru",
        toLang: selectedLanguage.value,
      },
    });

    if (response.success && response.translatedText) {
      // Загружаем переведенный текст в редактор
      descriptions.value[selectedLanguage.value] = response.translatedText;
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
  if (!quillEditor.value) return;

  // Сохраняем контент для текущего выбранного языка перед сохранением
  const htmlContent = quillEditor.value.root.innerHTML;
  descriptions.value[selectedLanguage.value] = htmlContent;
  savedHtml.value = htmlContent;

  // Если есть productId и categoryId, сохраняем в Google Sheets
  if (props.productId && props.categoryId) {
    try {
      const response = await $fetch("/api/update-product-description", {
        method: "POST",
        body: {
          productId: props.productId,
          categoryId: props.categoryId,
          description: htmlContent,
          language: selectedLanguage.value, // Передаем выбранный язык
        },
      });

      if (response.success) {
        alert(`✅ ${t("description.saved")}`);
        // Обновляем описания из пропсов после сохранения (перед перезагрузкой)
        // Но лучше перезагрузить страницу, чтобы получить актуальные данные
        window.location.reload();
      }
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert(
        `❌ ${t("description.error")} ${error.data?.message || error.message}`
      );
    }
  } else {
    // Если нет productId/categoryId, выводим в консоль (старый способ)
    const jsonOutput = JSON.stringify(htmlContent, null, 2);
    console.log("=".repeat(60));
    console.log("СОХРАНЕННЫЙ HTML ДЛЯ JSON:");
    console.log("=".repeat(60));
    console.log(jsonOutput);
    console.log("=".repeat(60));
    alert(t("description.savedLocal"));
  }

  closeEditor();
};

// Закрытие по Escape
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === "Escape" && isEditorOpen.value) {
      closeEditor();
    }
  };
  document.addEventListener("keydown", handleEscape);

  onUnmounted(() => {
    document.removeEventListener("keydown", handleEscape);
  });
});

// Сохраняем контент при закрытии редактора
const closeEditor = () => {
  if (quillEditor.value) {
    const currentContent = quillEditor.value.root.innerHTML;
    descriptions.value[selectedLanguage.value] = currentContent;
  }
  isEditorOpen.value = false;
  if (quillEditor.value) {
    quillEditor.value = null;
  }
};
</script>

<style scoped>
.tab-panel {
  font-size: 1rem;
  line-height: 1.8;
  color: #52606d;
}

.description-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
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

.description-content {
  line-height: 1.8;
}

.description-content :deep(h1),
.description-content :deep(h2),
.description-content :deep(h3) {
  margin: 16px 0 8px 0;
  font-weight: 700;
}

.description-content :deep(p) {
  margin: 8px 0;
}

.description-content :deep(ul),
.description-content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.description-content :deep(a) {
  color: #1e88e5;
  text-decoration: none;
}

.description-content :deep(a:hover) {
  text-decoration: underline;
}

.description-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  border: 1px solid #e5e7eb;
}

.description-content :deep(table th) {
  background: transparent !important;
  border: 1px solid #e5e7eb;
  padding: 12px;
  font-weight: 600;
  text-align: left;
  color: #1f2933;
}

.description-content :deep(table thead th) {
  background: transparent !important;
}

.description-content :deep(table tbody th) {
  background: transparent !important;
}

.description-content :deep(table tbody tr:nth-child(even)) {
  background: #f5f5f5;
}

.description-content :deep(table tbody tr:nth-child(even) td) {
  background: #f5f5f5;
}

.description-content :deep(table tbody tr:nth-child(even) th) {
  background: #f5f5f5 !important;
}

.description-content :deep(table tbody tr:hover) {
  background: #f9fafb;
}

.description-content :deep(table tbody tr:hover td) {
  background: #f9fafb;
}

.description-content :deep(table tbody tr:hover th) {
  background: #f9fafb !important;
}

.description-content :deep(table td) {
  border: 1px solid #e5e7eb;
  padding: 12px;
  color: #52606d;
}

.description-content :deep(table tr:hover) {
  background: #f9fafb;
}

.description-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.description-empty .edit-button {
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

  /* &:hover {
    border-color: #1e88e5;
  }

  &:focus {
    outline: none;
    border-color: #1e88e5;
    box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
  }
} */
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

.quill-editor {
  min-height: 500px;
}

/* Стили для таблиц в редакторе Quill */
.quill-editor :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  border: 1px solid #d1d5db;
  table-layout: auto;
  word-wrap: break-word;
  display: table;
  box-sizing: border-box;
}

.quill-editor :deep(table th),
.quill-editor :deep(table td) {
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

.quill-editor :deep(table th) {
  background: #f3f4f6;
  font-weight: 600;
  color: #1f2933;
}

.quill-editor :deep(table td) {
  background: #ffffff;
  color: #374151;
}

.quill-editor :deep(table tbody tr:nth-child(even) td) {
  background: #f9fafb;
}

.quill-editor :deep(table tbody tr:hover td) {
  background: #f3f4f6;
}

/* Улучшаем отображение вложенных элементов в таблицах */
.quill-editor :deep(table p) {
  margin: 0;
  padding: 0;
  line-height: 1.5;
}

.quill-editor :deep(table sub),
.quill-editor :deep(table sup) {
  font-size: 0.75em;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

.quill-editor :deep(table sub) {
  bottom: -0.25em;
}

.quill-editor :deep(table sup) {
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

@media (max-width: 768px) {
  .editor-modal {
    max-width: 100%;
    max-height: 95vh;
  }

  .editor-wrapper {
    padding: 16px;
    min-height: 300px;
  }
}
</style>
