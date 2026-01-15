<template>
  <div class="documentation-tab">
    <div v-if="!isEditing" class="documentation-view">
      <div v-if="documentation && documentation.blocks && Array.isArray(documentation.blocks) && documentation.blocks.length > 0">
        <div
          v-for="(block, blockIndex) in documentation.blocks"
          :key="blockIndex"
          class="documentation-block"
        >
          <h3 class="block-title">{{ getBlockTitle(block) }}</h3>
          <div class="documents-list">
            <a
              v-for="(doc, docIndex) in block.documents"
              :key="docIndex"
              :href="doc.url"
              target="_blank"
              rel="noopener"
              class="document-link"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>{{ getDocumentName(doc) }}</span>
            </a>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p class="muted">Документация не добавлена</p>
      </div>
      <button
        v-if="isAdmin"
        @click="startEditing"
        class="btn primary"
        style="margin-top: 24px"
      >
        {{ isEditing ? 'Отменить' : 'Редактировать' }}
      </button>
    </div>

    <div v-else class="documentation-editor">
      <div class="editor-header-section">
        <h3 style="margin: 0 0 16px;">Редактирование документации</h3>
        <button @click="addBlock" class="btn primary" type="button" style="margin-bottom: 24px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Добавить блок документации
        </button>
      </div>

      <div v-if="editingData.blocks && editingData.blocks.length === 0" class="empty-editor-state">
        <p class="muted">Начните с добавления блока документации</p>
      </div>
      
      <div
        v-for="(block, blockIndex) in editingData.blocks"
        :key="blockIndex"
        class="editor-block"
      >
        <div class="block-header">
          <div class="block-title-inputs">
            <h4>Название блока:</h4>
            <div class="lang-inputs">
              <input
                v-model="block.title.ru"
                placeholder="Русский"
                class="input"
              />
              <input
                v-model="block.title.en"
                placeholder="English"
                class="input"
              />
              <input
                v-model="block.title.kk"
                placeholder="Қазақша"
                class="input"
              />
            </div>
          </div>
          <button
            @click="removeBlock(blockIndex)"
            class="btn-remove"
            type="button"
          >
            Удалить блок
          </button>
        </div>

        <div class="documents-editor">
          <div
            v-for="(doc, docIndex) in block.documents"
            :key="docIndex"
            class="document-editor-item"
          >
            <div class="document-name-inputs">
              <h5>Название документа:</h5>
              <div class="lang-inputs">
                <input
                  v-model="doc.name.ru"
                  placeholder="Русский"
                  class="input"
                />
                <input
                  v-model="doc.name.en"
                  placeholder="English"
                  class="input"
                />
                <input
                  v-model="doc.name.kk"
                  placeholder="Қазақша"
                  class="input"
                />
              </div>
            </div>
            <div class="document-file-input">
              <label>
                <span>Файл:</span>
                <input
                  type="file"
                  @change="handleFileChange(blockIndex, docIndex, $event)"
                  class="file-input"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
                <span v-if="doc.fileName" class="file-name">{{ doc.fileName }}</span>
              </label>
            </div>
            <button
              @click="removeDocument(blockIndex, docIndex)"
              class="btn-remove-small"
              type="button"
            >
              Удалить
            </button>
          </div>
          <button
            @click="addDocument(blockIndex)"
            class="btn ghost"
            type="button"
          >
            + Добавить документ
          </button>
        </div>
      </div>

      <div class="editor-actions">
        <button @click="addBlock" class="btn primary" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Добавить блок
        </button>
        <div class="action-buttons">
          <button @click="cancelEditing" class="btn ghost" type="button">
            Отмена
          </button>
          <button
            @click="saveDocumentation"
            class="btn primary"
            type="button"
            :disabled="isSaving"
          >
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  productId: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
});

const { locale } = useI18n();
const route = useRoute();

const documentation = ref(null);
const isEditing = ref(false);
const isSaving = ref(false);
const editingData = ref({ blocks: [] });
const isAdmin = computed(() => {
  if (typeof window === 'undefined') return true; // На сервере всегда true для SSR
  const route = useRoute();
  // Разрешаем редактирование для всех (можно изменить логику позже)
  return true; // Временно разрешаем всем редактировать
  // return route.path.includes('/admin') || route.query.admin === 'true' || localStorage.getItem('isAdmin') === 'true';
});

const getBlockTitle = (block) => {
  if (!block || !block.title) return 'Без названия';
  return block.title[locale.value] || block.title.ru || block.title.en || block.title.kk || 'Без названия';
};

const getDocumentName = (doc) => {
  if (!doc || !doc.name) return 'Документ';
  return doc.name[locale.value] || doc.name.ru || doc.name.en || doc.name.kk || 'Документ';
};

const startEditing = () => {
  if (documentation.value && documentation.value.blocks && Array.isArray(documentation.value.blocks)) {
    try {
      editingData.value = JSON.parse(JSON.stringify(documentation.value));
    } catch (e) {
      console.warn('Ошибка при копировании документации:', e);
      editingData.value = { blocks: [] };
    }
  } else {
    editingData.value = { blocks: [] };
  }
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  editingData.value = { blocks: [] };
};

const addBlock = () => {
  editingData.value.blocks.push({
    title: { ru: '', en: '', kk: '' },
    documents: [],
  });
};

const removeBlock = (blockIndex) => {
  editingData.value.blocks.splice(blockIndex, 1);
};

const addDocument = (blockIndex) => {
  editingData.value.blocks[blockIndex].documents.push({
    name: { ru: '', en: '', kk: '' },
    url: '',
    path: '',
    fileName: '',
    file: null,
  });
};

const removeDocument = (blockIndex, docIndex) => {
  editingData.value.blocks[blockIndex].documents.splice(docIndex, 1);
};

const handleFileChange = (blockIndex, docIndex, event) => {
  const file = event.target.files[0];
  if (file) {
    const doc = editingData.value.blocks[blockIndex].documents[docIndex];
    doc.file = file;
    doc.fileName = file.name;
    
    // Обновляем путь при выборе нового файла
    // Старый URL и path очищаются, так как будет новый файл
    doc.url = '';
    doc.path = '';
    
    // Генерируем предварительный путь (окончательный будет на сервере)
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileExtension = safeFileName.split('.').pop() || '';
    const baseFileName = safeFileName.replace(/\.[^/.]+$/, '') || 'document';
    const fileName = `${props.productId}_${timestamp}_${baseFileName}.${fileExtension}`;
    
    // Устанавливаем предварительный путь (будет обновлен на сервере)
    doc.url = `/documents/${props.categoryId}/${props.productId}/${fileName}`;
    doc.path = `public/documents/${props.categoryId}/${props.productId}/${fileName}`;
  }
};

const saveDocumentation = async () => {
  try {
    // Валидация: проверяем, что все блоки имеют названия и документы
    if (!editingData.value || !editingData.value.blocks || !Array.isArray(editingData.value.blocks)) {
      alert('Ошибка: некорректная структура данных');
      isSaving.value = false;
      return;
    }

    for (const block of editingData.value.blocks) {
      if (!block) continue;
      
      if (!block.title || (!block.title.ru && !block.title.en && !block.title.kk)) {
        alert('Пожалуйста, заполните название блока хотя бы на одном языке');
        isSaving.value = false;
        return;
      }
      
      if (!block.documents || !Array.isArray(block.documents)) {
        continue;
      }
      
      for (const doc of block.documents) {
        if (!doc) continue;
        
        if (!doc.name || (!doc.name.ru && !doc.name.en && !doc.name.kk)) {
          alert('Пожалуйста, заполните название документа хотя бы на одном языке');
          isSaving.value = false;
          return;
        }
        
        // Проверяем наличие файла или URL (если документ уже был сохранен ранее)
        // Если есть URL, значит документ уже сохранен - это нормально
        // fileData будет добавлен позже при обработке файлов
        if (!doc.url && !doc.file && !doc.fileData) {
          alert('Пожалуйста, добавьте файл для документа');
          isSaving.value = false;
          return;
        }
      }
    }

    isSaving.value = true;

    // Сначала конвертируем все файлы в base64 из оригинальных данных
    // Это нужно сделать до фильтрации, чтобы не потерять связь между данными
    const fileMap = new Map(); // Карта для хранения fileData по ключу блока и документа
    
    for (let blockIndex = 0; blockIndex < editingData.value.blocks.length; blockIndex++) {
      const originalBlock = editingData.value.blocks[blockIndex];
      if (!originalBlock || !originalBlock.documents) continue;
      
      for (let docIndex = 0; docIndex < originalBlock.documents.length; docIndex++) {
        const originalDoc = originalBlock.documents[docIndex];
        if (!originalDoc) continue;
        
        // Проверяем, что файл существует и является File/Blob объектом
        // Если есть новый файл, обрабатываем его (даже если был старый URL)
        if (originalDoc.file && originalDoc.file instanceof File) {
          try {
            // Читаем файл как base64 из оригинального объекта
            const fileData = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target.result;
                // Убираем data:... префикс
                const base64Data = result.includes(',') ? result.split(',')[1] : result;
                resolve(base64Data);
              };
              reader.onerror = (error) => {
                console.error('FileReader error:', error);
                reject(new Error('Ошибка при чтении файла'));
              };
              reader.readAsDataURL(originalDoc.file);
            });
            
            // Сохраняем fileData в карту по ключу блока и документа
            const key = `${blockIndex}_${docIndex}`;
            fileMap.set(key, {
              fileData,
              fileName: originalDoc.fileName || originalDoc.file.name,
              hadOldUrl: !!originalDoc.url
            });
            
            if (originalDoc.url) {
              console.log(`Заменяем старый файл: ${originalDoc.url} на новый: ${fileMap.get(key).fileName}`);
            }
            
            console.log(`Файл подготовлен к загрузке: ${fileMap.get(key).fileName}`);
          } catch (fileError) {
            console.error('Ошибка при чтении файла:', fileError);
            alert(`Ошибка при чтении файла ${originalDoc.fileName || originalDoc.file?.name || 'неизвестный'}. Пожалуйста, попробуйте еще раз.`);
            isSaving.value = false;
            return;
          }
        }
      }
    }

    // Теперь подготавливаем данные для отправки
    const documentationToSave = JSON.parse(JSON.stringify(editingData.value));
    
    // Применяем fileData из карты к соответствующим документам
    for (let blockIndex = 0; blockIndex < documentationToSave.blocks.length; blockIndex++) {
      const block = documentationToSave.blocks[blockIndex];
      if (!block || !block.documents) continue;
      
      for (let docIndex = 0; docIndex < block.documents.length; docIndex++) {
        const doc = block.documents[docIndex];
        if (!doc) continue;
        
        const key = `${blockIndex}_${docIndex}`;
        if (fileMap.has(key)) {
          const fileInfo = fileMap.get(key);
          doc.fileData = fileInfo.fileData;
          doc.fileName = fileInfo.fileName;
          
          // Если был старый URL, очищаем его, так как будет новый файл
          if (fileInfo.hadOldUrl) {
            doc.url = '';
            doc.path = '';
          }
        }
      }
    }
    
    // Удаляем пустые блоки и документы
    documentationToSave.blocks = documentationToSave.blocks
      .filter(block => {
        if (!block) return false;
        // Удаляем пустые документы из блока
        block.documents = block.documents.filter(doc => 
          doc && (doc.name.ru || doc.name.en || doc.name.kk) && (doc.url || doc.fileData)
        );
        // Оставляем блок, если у него есть название и хотя бы один документ
        return (block.title.ru || block.title.en || block.title.kk) && block.documents.length > 0;
      });

    const response = await $fetch('/api/update-documentation', {
      method: 'POST',
      body: {
        productId: props.productId,
        categoryId: props.categoryId,
        documentation: documentationToSave,
      },
    });

    if (response.success) {
      documentation.value = response.documentation;
      isEditing.value = false;
      // Перезагружаем документацию для обновления данных
      await loadDocumentation();
      alert(response.message || 'Документация успешно сохранена в Google Sheets и обновлена в проекте!');
    } else {
      throw new Error(response.error || 'Ошибка при сохранении');
    }
  } catch (error) {
    console.error('Ошибка при сохранении документации:', error);
    alert('Ошибка при сохранении документации: ' + (error.message || error));
  } finally {
    isSaving.value = false;
  }
};

const loadDocumentation = async () => {
  try {
    if (!props.categoryId || !props.productId) return;
    
    // Загружаем документацию из продукта
    const categoryData = await $fetch(`/data/${props.categoryId}.json`);
    const product = categoryData.find((p) => p.id === props.productId);
    
    if (product && product.documentation) {
      if (typeof product.documentation === 'string') {
        try {
          documentation.value = JSON.parse(product.documentation);
        } catch (e) {
          console.warn('Ошибка парсинга documentation:', e);
          documentation.value = null;
        }
      } else {
        documentation.value = product.documentation;
      }
    } else {
      documentation.value = null;
    }
  } catch (error) {
    console.error('Ошибка при загрузке документации:', error);
    documentation.value = null;
  }
};

onMounted(() => {
  loadDocumentation();
});

watch([() => props.productId, () => props.categoryId], () => {
  loadDocumentation();
});
</script>

<style lang="scss" scoped>
.documentation-tab {
  font-size: 1rem;
  line-height: 1.8;
  color: #52606d;
}

.documentation-view {
  .documentation-block {
    margin-bottom: 32px;
    padding: 24px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .block-title {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 600;
    color: #1f2933;
  }

  .documents-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .document-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #f8fafc;
    border-radius: 8px;
    color: #1e88e5;
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(30, 136, 229, 0.1);
      transform: translateX(4px);
    }

    svg {
      flex-shrink: 0;
      color: #1e88e5;
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
  color: #9ca3af;
  }
}

.documentation-editor {
  .editor-block {
    margin-bottom: 32px;
    padding: 24px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 2px solid #e5e7eb;
  }

  .block-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .block-title-inputs {
    flex: 1;

    h4 {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 600;
      color: #1f2933;
    }
  }

  .lang-inputs {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: #1e88e5;
      box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
    }
  }

  .documents-editor {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .document-editor-item {
    padding: 20px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .document-name-inputs {
    margin-bottom: 16px;

    h5 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: #52606d;
    }
  }

  .document-file-input {
    margin-bottom: 12px;

    label {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 14px;
      color: #52606d;
    }

    .file-input {
      padding: 8px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
    }

    .file-name {
      color: #1e88e5;
      font-weight: 500;
    }
  }

  .btn-remove {
    padding: 8px 16px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s ease;

    &:hover {
      background: #dc2626;
    }
  }

  .btn-remove-small {
    padding: 6px 12px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.2s ease;

    &:hover {
      background: #dc2626;
    }
  }
}

.empty-editor-state {
  text-align: center;
  padding: 40px 20px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 2px dashed #e5e7eb;
}

.editor-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  gap: 16px;

  .action-buttons {
    display: flex;
    gap: 12px;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 767.98px) {
  .block-header {
    flex-direction: column;
    gap: 16px;
  }

  .editor-actions {
    flex-direction: column;
    gap: 16px;

    .action-buttons {
      width: 100%;
      flex-direction: column;
    }
  }
}
</style>
