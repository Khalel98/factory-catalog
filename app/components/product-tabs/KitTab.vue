<template>
  <div class="tab-panel">
    <div v-if="!hasKit" class="kit-empty">
      <div class="empty-buttons" v-if="isAdmin">
        <button class="insert-html-button" @click="openHtmlDialog">
          &lt;/&gt; {{ t("kit.insertHtml") }}
        </button>
        <button class="edit-button" @click="openEditor">
          {{ t("kit.edit") }}
        </button>
      </div>
    </div>
    <div v-else>
      <div class="kit-header">
        <div class="header-buttons" v-if="isAdmin">
          <button class="insert-html-button" @click="openHtmlDialog">
            &lt;/&gt; {{ t("kit.insertHtml") }}
          </button>
          <button class="edit-button" @click="openEditor">
            {{ t("kit.edit") }}
          </button>
        </div>
      </div>
      <div class="kit-content" v-html="getCurrentKit()"></div>
    </div>

    <!-- Модальное окно редактора -->
    <ClientOnly>
      <Teleport to="body">
        <div v-if="isEditorOpen" class="editor-overlay" @click="closeEditor">
          <div class="editor-modal" @click.stop>
            <div class="editor-header">
              <h3>{{ t("kit.editorTitle") }}</h3>
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
                    kits.ru &&
                    kits.ru.trim()
                  "
                  class="translate-button"
                  @click="translateKit"
                  :disabled="isTranslating"
                  :title="t('kit.translate')"
                >
                  {{ isTranslating ? "⏳" : "🌐" }}
                  {{ t("kit.translate") }}
                </button>
                <button
                  class="table-button"
                  @click="insertTable"
                  :title="t('kit.table')"
                >
                  📊 {{ t("kit.table") }}
                </button>
                <button class="close-button" @click="closeEditor">×</button>
              </div>
            </div>
            <div class="editor-wrapper">
              <div ref="editorContainer" class="quill-editor"></div>
            </div>
            <div class="editor-actions">
              <button class="btn-cancel" @click="closeEditor">
                {{ t("kit.cancel") }}
              </button>
              <button class="btn-save" @click="saveContent">
                {{ t("kit.save") }}
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
              <h3>{{ t("kit.insertHtml") }}</h3>
              <div class="header-actions">
                <select
                  v-model="htmlDialogLanguage"
                  class="language-selector"
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇬🇧 English</option>
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
                  :title="t('kit.translate')"
                >
                  {{ isTranslatingHtml ? "⏳" : "🌐" }}
                  {{ t("kit.translate") }}
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
                {{ t("kit.cancel") }}
              </button>
              <button class="btn-save" @click="insertHtmlToLanguage">
                {{ t("kit.save") }}
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
  kit: {
    type: String,
    default: "",
  },
  kitRU: {
    type: String,
    default: "",
  },
  kitEN: {
    type: String,
    default: "",
  },
  kitKK: {
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
const kits = ref({
  ru: "",
  en: "",
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

const hasKit = computed(() => {
  return (
    savedHtml.value ||
    (props.kit && props.kit.trim() !== "") ||
    (props.kitRU && props.kitRU.trim() !== "") ||
    (props.kitEN && props.kitEN.trim() !== "") ||
    (props.kitKK && props.kitKK.trim() !== "")
  );
});

// Функция для получения текущего описания в зависимости от языка интерфейса
const getCurrentKit = () => {
  // Если есть savedHtml (после редактирования), используем его
  if (savedHtml.value) {
    return savedHtml.value;
  }

  // Иначе используем комплект поставки в зависимости от текущего языка интерфейса
  const currentLang = locale.value;
  if (currentLang === "en" && props.kitEN) {
    return props.kitEN;
  }
  if (currentLang === "kk" && props.kitKK) {
    return props.kitKK;
  }
  // По умолчанию русское
  return props.kitRU || props.kit || "";
};

// Функция для обновления описаний из пропсов
const updateKitsFromProps = () => {
  kits.value.ru = props.kitRU || "";
  kits.value.en = props.kitEN || "";
  kits.value.kk = props.kitKK || "";

  // Логируем для отладки
  console.log("updateKitsFromProps:", {
    ru: kits.value.ru.substring(0, 50),
    en: kits.value.en.substring(0, 50),
    kk: kits.value.kk.substring(0, 50),
    propsEN: props.kitEN?.substring(0, 50),
  });

  // Если есть общее комплект поставки, используем его для текущего языка, если для него нет отдельного
  if (props.kit) {
    const currentLang = locale.value;
    if (
      !kits.value[currentLang] ||
      kits.value[currentLang].trim() === ""
    ) {
      kits.value[currentLang] = props.kit;
    }
  }
  savedHtml.value = kits.value[locale.value] || "";
};

// Инициализация описаний при монтировании
onMounted(() => {
  updateKitsFromProps();
});

// Отслеживание изменений описаний в пропсах
watch(
  () => [
    props.kitRU,
    props.kitEN,
    props.kitKK,
    props.kit,
  ],
  () => {
    updateKitsFromProps();
  },
  { immediate: true }
);

// Отслеживание изменения языка интерфейса для обновления отображаемого описания
watch(
  () => locale.value,
  () => {
    // Обновляем savedHtml при смене языка интерфейса
    savedHtml.value = kits.value[locale.value] || "";
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

const openHtmlDialog = () => {
  htmlDialogLanguage.value = locale.value || "ru";
  
  // Загружаем существующий HTML для выбранного языка
  let existingHtml = kits.value[htmlDialogLanguage.value] || "";
  
  // Если в kits нет, пытаемся взять из пропсов
  if (!existingHtml || existingHtml.trim() === "") {
    if (htmlDialogLanguage.value === "ru") {
      existingHtml = props.kitRU || "";
    } else if (htmlDialogLanguage.value === "en") {
      existingHtml = props.kitEN || "";
    } else if (htmlDialogLanguage.value === "kk") {
      existingHtml = props.kitKK || "";
    }
    
    // Если нашли в пропсах, обновляем kits
    if (existingHtml && existingHtml.trim()) {
      kits.value[htmlDialogLanguage.value] = existingHtml;
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

  const htmlContent = htmlToInsert.value.trim();

  // Сохраняем напрямую в Google Sheets (всегда режим просмотра)
  try {
    // Обновляем kits для выбранного языка
    kits.value[htmlDialogLanguage.value] = htmlContent;

    // Если есть productId и categoryId, сохраняем в Google Sheets
    if (props.productId && props.categoryId) {
      try {
        const response = await $fetch("/api/update-product-kit", {
          method: "POST",
          body: {
            productId: props.productId,
            categoryId: props.categoryId,
            kit: htmlContent,
            language: htmlDialogLanguage.value,
          },
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
          `❌ ${t("kit.error")} ${error.data?.message || error.message}`
        );
      }
    } else {
      // Если нет productId/categoryId, сохраняем локально
      kits.value[htmlDialogLanguage.value] = htmlContent;
      savedHtml.value = htmlContent;
      alert(t("kit.savedLocal"));
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

  // Обновляем описания из пропсов перед открытием редактора
  updateKitsFromProps();

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
      placeholder: "Введите комплект поставки...",
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

  // Берем контент напрямую из пропсов, если в kits его нет
  let content = kits.value[lang] || "";

  // Если контент пустой, пытаемся взять из пропсов напрямую
  if (!content || content.trim() === "") {
    if (lang === "ru") {
      content = props.kitRU || "";
    } else if (lang === "en") {
      content = props.kitEN || "";
    } else if (lang === "kk") {
      content = props.kitKK || "";
    }
    // Обновляем kits для будущего использования
    if (content) {
      kits.value[lang] = content;
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
  kits.value[previousLanguage.value] = currentContent;

  // Обновляем предыдущий язык на новый выбранный
  previousLanguage.value = selectedLanguage.value;

  // Загружаем контент для нового языка из kits (который может быть обновлен из пропсов)
  loadContentForLanguage(selectedLanguage.value);
};

// Функция перевода описания
const translateKit = async () => {
  if (
    !quillEditor.value ||
    !kits.value.ru ||
    !kits.value.ru.trim()
  ) {
    alert("Сначала создайте комплект поставки на русском языке");
    return;
  }

  if (selectedLanguage.value === "ru") {
    alert("Выберите другой язык для перевода");
    return;
  }

  // Проверяем, есть ли уже перевод
  if (
    kits.value[selectedLanguage.value] &&
    kits.value[selectedLanguage.value].trim()
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
        text: kits.value.ru,
        fromLang: "ru",
        toLang: selectedLanguage.value,
      },
    });

    if (response.success && response.translatedText) {
      // Загружаем переведенный текст в редактор
      kits.value[selectedLanguage.value] = response.translatedText;
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
  kits.value[selectedLanguage.value] = htmlContent;
  savedHtml.value = htmlContent;

  // Если есть productId и categoryId, сохраняем в Google Sheets
  if (props.productId && props.categoryId) {
    try {
      const response = await $fetch("/api/update-product-kit", {
        method: "POST",
        body: {
          productId: props.productId,
          categoryId: props.categoryId,
          kit: htmlContent,
          language: selectedLanguage.value, // Передаем выбранный язык
        },
      });

      if (response.success) {
        alert(`✅ ${t("kit.saved")}`);
        // Обновляем описания из пропсов после сохранения (перед перезагрузкой)
        // Но лучше перезагрузить страницу, чтобы получить актуальные данные
        window.location.reload();
      }
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert(
        `❌ ${t("kit.error")} ${error.data?.message || error.message}`
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
    alert(t("kit.savedLocal"));
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
const closeEditor = () => {
  if (quillEditor.value) {
    const currentContent = quillEditor.value.root.innerHTML;
    kits.value[selectedLanguage.value] = currentContent;
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

.kit-header {
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

.kit-content {
  line-height: 1.8;
}

.kit-content :deep(h1),
.kit-content :deep(h2),
.kit-content :deep(h3) {
  margin: 16px 0 8px 0;
  font-weight: 700;
}

.kit-content :deep(p) {
  margin: 8px 0;
}

.kit-content :deep(ul),
.kit-content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.kit-content :deep(a) {
  color: #1e88e5;
  text-decoration: none;
}

.kit-content :deep(a:hover) {
  text-decoration: underline;
}

.kit-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  border: 1px solid #e5e7eb;
}

.kit-content :deep(table th) {
  background: transparent !important;
  border: 1px solid #e5e7eb;
  padding: 12px;
  font-weight: 600;
  text-align: left;
  color: #1f2933;
}

.kit-content :deep(table thead th) {
  background: transparent !important;
}

.kit-content :deep(table tbody th) {
  background: transparent !important;
}

.kit-content :deep(table tbody tr:nth-child(even)) {
  background: #f5f5f5;
}

.kit-content :deep(table tbody tr:nth-child(even) td) {
  background: #f5f5f5;
}

.kit-content :deep(table tbody tr:nth-child(even) th) {
  background: #f5f5f5 !important;
}

.kit-content :deep(table tbody tr:hover) {
  background: #f9fafb;
}

.kit-content :deep(table tbody tr:hover td) {
  background: #f9fafb;
}

.kit-content :deep(table tbody tr:hover th) {
  background: #f9fafb !important;
}

.kit-content :deep(table td) {
  border: 1px solid #e5e7eb;
  padding: 12px;
  color: #52606d;
}

.kit-content :deep(table tr:hover) {
  background: #f9fafb;
}

.kit-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.kit-empty .edit-button {
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

.html-button {
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

.html-button:hover {
  background: #7b1fa2;
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

.html-dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2933;
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
  .editor-modal {
    max-width: 100%;
    max-height: 95vh;
  }

  .editor-wrapper {
    padding: 16px;
    min-height: 300px;
  }

  .html-dialog {
    max-width: 100%;
  }
}
</style>
