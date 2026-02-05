<template>
  <div class="video-tab">
    <div v-if="!isEditing" class="video-view">
      <div v-if="videos && videos.videos && Array.isArray(videos.videos) && videos.videos.length > 0">
        <h3 class="section-title" v-if="getTitle()">{{ getTitle() }}</h3>
        <div class="videos-grid">
          <div
            v-for="(video, videoIndex) in videos.videos"
            :key="videoIndex"
            class="video-item"
          >
            <div class="video-wrapper">
              <iframe
                :src="getYouTubeEmbedUrl(video.url)"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="video-iframe"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p class="muted">Видео не добавлены</p>
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

    <div v-else class="video-editor">
      <div class="editor-header-section">
        <h3 style="margin: 0 0 16px;">Редактирование видео</h3>
        
        <div class="title-section">
          <h4>Название раздела (на двух языках):</h4>
          <div class="lang-inputs">
            <input
              v-model="editingData.title.ru"
              placeholder="Русский"
              class="input"
            />
            <input
              v-model="editingData.title.kk"
              placeholder="Қазақша"
              class="input"
            />
          </div>
        </div>
      </div>

      <div class="videos-editor">
        <h4 style="margin: 0 0 16px;">Видео:</h4>
        <div v-if="editingData.videos && editingData.videos.length === 0" class="empty-editor-state">
          <p class="muted">Начните с добавления видео</p>
        </div>
        
        <div
          v-for="(video, videoIndex) in editingData.videos"
          :key="videoIndex"
          class="video-editor-item"
        >
          <div class="video-url-input">
            <label>
              <span>Ссылка YouTube:</span>
              <input
                v-model="video.url"
                placeholder="https://www.youtube.com/watch?v=..."
                class="input"
                type="url"
              />
            </label>
          </div>
          <button
            @click="removeVideo(videoIndex)"
            class="btn-remove-small"
            type="button"
          >
            Удалить
          </button>
        </div>
        
        <button
          @click="addVideo"
          class="btn ghost"
          type="button"
          style="margin-top: 16px;"
        >
          + Добавить видео
        </button>
      </div>

      <div class="editor-actions">
        <div class="action-buttons">
          <button @click="cancelEditing" class="btn ghost" type="button">
            Отмена
          </button>
          <button
            @click="saveVideos"
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

const emit = defineEmits(['videos-updated']);

const { locale } = useI18n();
const route = useRoute();

const videos = ref(null);
const isEditing = ref(false);
const isSaving = ref(false);
const editingData = ref({ title: { ru: '', kk: '' }, videos: [] });
const isAdmin = computed(() => {
  if (process.client) {
    return localStorage.getItem('isAdmin') === 'true';
  }
  return false;
});

const getTitle = () => {
  if (!videos.value || !videos.value.title) return '';
  return videos.value.title[locale.value] || videos.value.title.ru || videos.value.title.kk || '';
};


const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  
  // Конвертируем различные форматы YouTube URL в embed формат
  let videoId = '';
  
  // Стандартный формат: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  } else {
    // Если не удалось распарсить, возвращаем исходную ссылку
    return url;
  }
  
  return `https://www.youtube.com/embed/${videoId}`;
};

const startEditing = () => {
  if (videos.value) {
    try {
      editingData.value = JSON.parse(JSON.stringify(videos.value));
      // Убеждаемся, что структура правильная
      if (!editingData.value.title) {
        editingData.value.title = { ru: '', en: '', kk: '' };
      }
      if (!editingData.value.videos || !Array.isArray(editingData.value.videos)) {
        editingData.value.videos = [];
      }
    } catch (e) {
      console.warn('Ошибка при копировании видео:', e);
      editingData.value = { title: { ru: '', en: '', kk: '' }, videos: [] };
    }
  } else {
    editingData.value = { title: { ru: '', en: '', kk: '' }, videos: [] };
  }
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  editingData.value = { title: { ru: '', en: '', kk: '' }, videos: [] };
};

const addVideo = () => {
  if (!editingData.value.videos) {
    editingData.value.videos = [];
  }
  editingData.value.videos.push({
    url: '',
  });
};

const removeVideo = (videoIndex) => {
  if (editingData.value.videos && Array.isArray(editingData.value.videos)) {
    editingData.value.videos.splice(videoIndex, 1);
  }
};

const saveVideos = async () => {
  try {
    // Валидация: проверяем структуру данных
    if (!editingData.value || !editingData.value.videos || !Array.isArray(editingData.value.videos)) {
      alert('Ошибка: некорректная структура данных');
      isSaving.value = false;
      return;
    }

    // Валидация видео
    for (const video of editingData.value.videos) {
      if (!video) continue;
      
      if (!video.url || !video.url.trim()) {
        alert('Пожалуйста, добавьте ссылку YouTube для видео');
        isSaving.value = false;
        return;
      }
      
      // Проверяем, что это валидная YouTube ссылка
      const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
      if (!youtubeRegex.test(video.url)) {
        alert('Пожалуйста, укажите корректную ссылку YouTube');
        isSaving.value = false;
        return;
      }
    }

    isSaving.value = true;

    // Подготавливаем данные для отправки
    const videosToSave = JSON.parse(JSON.stringify(editingData.value));
    
    // Удаляем пустые видео
    videosToSave.videos = videosToSave.videos.filter(video => 
      video && video.url && video.url.trim()
    );
    
    // Убеждаемся, что title существует
    if (!videosToSave.title) {
      videosToSave.title = { ru: '', kk: '' };
    }

    const response = await $fetch('/api/update-videos', {
      method: 'POST',
      body: {
        productId: props.productId,
        categoryId: props.categoryId,
        videos: videosToSave,
      },
    });

    if (response.success) {
      videos.value = response.videos;
      isEditing.value = false;
      // Перезагружаем видео для обновления данных с обходом кеша
      await loadVideos(true);
      // Уведомляем родительский компонент об обновлении
      emit('videos-updated', response.videos);
      alert(response.message || 'Видео успешно сохранены в Google Sheets и обновлены в проекте!');
    } else {
      throw new Error(response.error || 'Ошибка при сохранении');
    }
  } catch (error) {
    console.error('Ошибка при сохранении видео:', error);
    alert('Ошибка при сохранении видео: ' + (error.message || error));
  } finally {
    isSaving.value = false;
  }
};

const loadVideos = async (forceReload = false) => {
  try {
    if (!props.categoryId || !props.productId) return;
    
    // Загружаем видео из продукта с обходом кеша при необходимости
    const url = `/data/${props.categoryId}.json${forceReload ? '?t=' + Date.now() : ''}`;
    const categoryData = await $fetch(url);
    const product = categoryData.find((p) => p.id === props.productId);
    
    if (product && product.videos) {
      if (typeof product.videos === 'string') {
        try {
          videos.value = JSON.parse(product.videos);
        } catch (e) {
          console.warn('Ошибка парсинга videos:', e);
          videos.value = null;
        }
      } else {
        videos.value = product.videos;
      }
    } else {
      videos.value = null;
    }
  } catch (error) {
    console.error('Ошибка при загрузке видео:', error);
    videos.value = null;
  }
};

onMounted(() => {
  loadVideos();
});

watch([() => props.productId, () => props.categoryId], () => {
  loadVideos();
});
</script>

<style lang="scss" scoped>
.video-tab {
  font-size: 1rem;
  line-height: 1.8;
  color: #52606d;
}

.video-view {
  .section-title {
    margin: 0 0 24px;
    font-size: 20px;
    font-weight: 600;
    color: #1f2933;
  }

  .videos-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;

    @media (max-width: 767.98px) {
      grid-template-columns: 1fr;
    }
  }

  .video-item {
    display: flex;
    flex-direction: column;
  }

  .video-wrapper {
    position: relative;
    padding-bottom: 56.25%; // 16:9 aspect ratio
    height: 0;
    overflow: hidden;
    border-radius: 8px;
    background: #000;
  }

  .video-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #9ca3af;
  }
}

.video-editor {
  .title-section {
    margin-bottom: 32px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e5e7eb;

    h4 {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 600;
      color: #1f2933;
    }
  }

  .videos-editor {
    margin-bottom: 24px;
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

  .videos-editor {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .video-editor-item {
    padding: 20px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .video-url-input {
    flex: 1;
    margin-bottom: 12px;

    label {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 14px;
      color: #52606d;
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
