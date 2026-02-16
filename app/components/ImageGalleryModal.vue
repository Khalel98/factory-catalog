<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ t('gallery.editImages') }}</h2>
        <button @click="closeModal" class="close-button" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="images-list">
          <div
            v-for="(image, index) in editingImages"
            :key="index"
            class="image-item"
          >
            <div class="image-preview">
              <img :src="getImageUrl(image)" :alt="`Изображение ${index + 1}`" />
              <button
                @click="removeImage(index)"
                class="remove-image-btn"
                type="button"
                :title="t('gallery.removeImage')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="image-actions">
              <label class="file-input-label">
                <input
                  type="file"
                  accept="image/*"
                  @change="handleFileChange(index, $event)"
                  class="file-input"
                />
                <span class="file-input-text">{{ image.file ? t('gallery.replaceImage') : t('gallery.selectImage') }}</span>
              </label>
              <span v-if="image.fileName" class="file-name">{{ image.fileName }}</span>
            </div>
          </div>
        </div>

        <button @click="addImage" class="btn primary add-image-btn" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {{ t('gallery.addImage') }}
        </button>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn secondary" type="button">
          {{ t('gallery.cancel') }}
        </button>
        <button @click="saveImages" class="btn primary" type="button" :disabled="isSaving">
          {{ isSaving ? t('gallery.saving') : t('gallery.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from '@/composables/useI18n';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  images: {
    type: Array,
    default: () => [],
  },
  productId: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close', 'saved']);

const { t } = useI18n();
const editingImages = ref([]);
const isSaving = ref(false);

// Проверка, является ли пользователь админом
const isAdmin = computed(() => {
  if (process.client) {
    return localStorage.getItem('isAdmin') === 'true';
  }
  return false;
});

// Инициализация данных при открытии модального окна
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    // Копируем изображения для редактирования
    editingImages.value = props.images.map(img => ({
      url: img,
      path: img.startsWith('/images/') ? `public${img}` : img,
      file: null,
      fileName: '',
      fileData: null,
    }));
  }
});

const getImageUrl = (image) => {
  if (image.file) {
    return URL.createObjectURL(image.file);
  }
  if (image.url) {
    return image.url;
  }
  return '';
};

const addImage = () => {
  editingImages.value.push({
    url: '',
    path: '',
    file: null,
    fileName: '',
    fileData: null,
  });
};

const removeImage = (index) => {
  editingImages.value.splice(index, 1);
};

const handleFileChange = (index, event) => {
  const file = event.target.files[0];
  if (file) {
    editingImages.value[index].file = file;
    editingImages.value[index].fileName = file.name;
    // Очищаем старый URL и path, так как будет новый файл
    editingImages.value[index].url = '';
    editingImages.value[index].path = '';
  }
};

const closeModal = () => {
  emit('close');
};

const saveImages = async () => {
  if (!isAdmin.value) {
    alert('У вас нет прав для редактирования');
    return;
  }

  try {
    isSaving.value = true;

    // Сначала конвертируем все файлы в base64
    const fileMap = new Map();
    
    for (let index = 0; index < editingImages.value.length; index++) {
      const image = editingImages.value[index];
      
      if (image.file && image.file instanceof File) {
        try {
          const fileData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target.result;
              const base64Data = result.includes(',') ? result.split(',')[1] : result;
              resolve(base64Data);
            };
            reader.onerror = (error) => {
              console.error('FileReader error:', error);
              reject(new Error('Ошибка при чтении файла'));
            };
            reader.readAsDataURL(image.file);
          });
          
          fileMap.set(index, {
            fileData,
            fileName: image.fileName || image.file.name,
            hadOldUrl: !!image.url
          });
          
          if (image.url) {
            console.log(`Заменяем старое изображение: ${image.url} на новое: ${fileMap.get(index).fileName}`);
          }
          
          console.log(`Изображение подготовлено к загрузке: ${fileMap.get(index).fileName}`);
        } catch (fileError) {
          console.error('Ошибка при чтении файла:', fileError);
          alert(`Ошибка при чтении файла ${image.fileName || image.file?.name || 'неизвестный'}. Пожалуйста, попробуйте еще раз.`);
          isSaving.value = false;
          return;
        }
      }
    }

    // Подготавливаем данные для отправки
    const imagesToSave = editingImages.value.map((image, index) => {
      const imageData = {
        url: image.url,
        path: image.path,
        fileName: image.fileName,
      };
      
      if (fileMap.has(index)) {
        const fileInfo = fileMap.get(index);
        imageData.fileData = fileInfo.fileData;
        imageData.fileName = fileInfo.fileName;
        
        if (fileInfo.hadOldUrl) {
          imageData.url = '';
          imageData.path = '';
        }
      }
      
      return imageData;
    });

    // Фильтруем только валидные изображения (с URL или fileData)
    const validImages = imagesToSave.filter(img => img.url || img.fileData);

    // Отправляем на сервер
    const response = await $fetch('/api/update-images', {
      method: 'POST',
      body: {
        productId: props.productId,
        categoryId: props.categoryId,
        images: validImages,
      },
    });

    if (response.success) {
      emit('saved', response.images);
      closeModal();
    } else {
      alert(response.message || t('gallery.errorSaving'));
    }
  } catch (error) {
    console.error('Ошибка при сохранении изображений:', error);
    alert(t('gallery.errorSaving'));
  } finally {
    isSaving.value = false;
  }
};
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2933;
  }
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #52606d;
  transition: color 0.2s ease;
  border-radius: 4px;

  &:hover {
    color: #1f2933;
    background: #f5f5f5;
  }
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.images-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.image-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  border: 2px solid #e5e7eb;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(220, 38, 38, 1);
    transform: scale(1.1);
  }
}

.image-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-input-label {
  display: block;
  cursor: pointer;
}

.file-input {
  display: none;
}

.file-input-text {
  display: block;
  padding: 8px 12px;
  background: #16396C;
  color: white;
  border-radius: 6px;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: #1565c0;
  }
}

.file-name {
  font-size: 0.75rem;
  color: #52606d;
  text-align: center;
  word-break: break-word;
}

.add-image-btn {
  width: 100%;
  margin-top: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn.primary {
  background: #16396C;
  color: white;

  &:hover:not(:disabled) {
    background: #1565c0;
  }
}

.btn.secondary {
  background: #e5e7eb;
  color: #52606d;

  &:hover:not(:disabled) {
    background: #d1d5db;
  }
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .images-list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
}
</style>
