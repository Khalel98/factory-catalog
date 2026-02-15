<template>
  <ClientOnly>
    <div class="product-gallery" v-if="images && images.length > 0">
      <div class="gallery-main">
        <button
          v-if="isAdmin"
          @click="openEditModal"
          class="edit-gallery-btn"
          type="button"
          :title="t('gallery.editImages')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <Swiper
          :modules="modules"
          :slides-per-view="1"
          :space-between="10"
          :navigation="true"
          :pagination="{ clickable: true, dynamicBullets: true }"
          :loop="images.length > 1"
          :thumbs="{ swiper: thumbsSwiper }"
          class="main-swiper"
        >
          <SwiperSlide v-for="(image, index) in images" :key="index">
            <div class="slide-image-wrapper" @click="openFullscreen(index)">
              <img
                :src="image"
                :alt="`${productName} - изображение ${index + 1}`"
                @error="handleImageError($event)"
                loading="lazy"
                style="cursor: pointer;"
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <div class="gallery-thumbs" v-if="images.length > 1">
        <Swiper
          :modules="modules"
          :slides-per-view="4"
          :space-between="10"
          :free-mode="true"
          :watch-slides-progress="true"
          @swiper="setThumbsSwiper"
          class="thumbs-swiper"
        >
          <SwiperSlide v-for="(image, index) in images" :key="index">
            <div class="thumb-image-wrapper">
              <img
                :src="image"
                :alt="`${productName} - миниатюра ${index + 1}`"
                @error="handleImageError($event)"
                loading="lazy"
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
    <div v-else-if="isAdmin" class="product-gallery-empty">
      <button @click="openEditModal" class="btn-add-images" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        {{ t('gallery.addImages') }}
      </button>
    </div>
    <template #fallback>
      <div class="product-gallery-loading">
        <div class="loading-placeholder">
          <div class="placeholder-image"></div>
        </div>
      </div>
    </template>
    <ImageGalleryModal
      :is-open="isEditModalOpen"
      :images="images"
      :product-id="productId"
      :category-id="categoryId"
      @close="closeEditModal"
      @saved="handleImagesSaved"
    />
    <!-- Fullscreen Lightbox -->
    <div v-if="isFullscreenOpen" class="fullscreen-overlay" @click.self="closeFullscreen">
      <button @click="closeFullscreen" class="fullscreen-close" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <Swiper
        :modules="modules"
        :slides-per-view="1"
        :space-between="0"
        :navigation="true"
        :pagination="{ clickable: true, dynamicBullets: true }"
        :loop="images.length > 1"
        :initial-slide="fullscreenInitialSlide"
        class="fullscreen-swiper"
        @swiper="setFullscreenSwiper"
      >
        <SwiperSlide v-for="(image, index) in images" :key="index">
          <div class="fullscreen-slide">
            <img
              :src="image"
              :alt="`${productName} - изображение ${index + 1}`"
              @error="handleImageError($event)"
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Thumbs, FreeMode, Pagination } from "swiper/modules";
import { useI18n } from "@/composables/useI18n";
import ImageGalleryModal from "./ImageGalleryModal.vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import "swiper/css/pagination";

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => [],
  },
  productName: {
    type: String,
    default: "",
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

const emit = defineEmits(['images-updated']);

const { t } = useI18n();
const modules = [Navigation, Thumbs, FreeMode, Pagination];
const thumbsSwiper = ref(null);
const fullscreenSwiper = ref(null);
const isEditModalOpen = ref(false);
const isFullscreenOpen = ref(false);
const fullscreenInitialSlide = ref(0);

// Проверка, является ли пользователь админом
const isAdmin = computed(() => {
  if (process.client) {
    return localStorage.getItem('isAdmin') === 'true';
  }
  return false;
});

const setThumbsSwiper = (swiper) => {
  thumbsSwiper.value = swiper;
};

const setFullscreenSwiper = (swiper) => {
  fullscreenSwiper.value = swiper;
};

const openFullscreen = (index) => {
  fullscreenInitialSlide.value = index;
  isFullscreenOpen.value = true;
  document.body.style.overflow = 'hidden';
};

const closeFullscreen = () => {
  isFullscreenOpen.value = false;
  document.body.style.overflow = '';
};

// Обработка клавиши Escape
const handleEscape = (event) => {
  if (event.key === 'Escape' && isFullscreenOpen.value) {
    closeFullscreen();
  }
};

// Добавляем слушатель при открытии полноэкранного режима
watch(isFullscreenOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleEscape);
  } else {
    document.removeEventListener('keydown', handleEscape);
  }
});

// Очистка при размонтировании
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});

const handleImageError = (event) => {
  // Заменяем на placeholder, если изображение не загрузилось
  event.target.src =
    "https://via.placeholder.com/800x600/e5e7eb/9ca3af?text=Изображение+не+загружено";
  event.target.onerror = null; // Предотвращаем бесконечный цикл ошибок
};

const openEditModal = () => {
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const handleImagesSaved = (newImages) => {
  emit('images-updated', newImages);
  closeEditModal();
};
</script>

<style lang="scss" scoped>
.product-gallery {
  width: 100%;
  max-width: 400px;
  min-width: 0; /* позволяет сжиматься внутри grid/flex */
  margin: 0 auto;
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;
}

.gallery-main {
  margin-bottom: 16px;
  position: relative;
  min-width: 0;
  max-width: 100%;
}

.edit-gallery-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #1e88e5;

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

.product-gallery-empty {
  width: 100%;
  max-width: 400px;
  min-width: 0;
  margin: 0 auto;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12px;
  border: 2px dashed #d1d5db;
  box-sizing: border-box;
  overflow: hidden;
}

.btn-add-images {
  padding: 16px 32px;
  background: #1e88e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #1565c0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
  }
}

.main-swiper {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.slide-image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.slide-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.gallery-thumbs {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.thumbs-swiper {
  width: 100%;
  height: 60px;
}

.thumb-image-wrapper {
  width: 100%;
  height: 100%;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
  background: #f5f5f5;
}

.thumb-image-wrapper:hover {
  border-color: #3b82f6;
}

.thumb-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Стилизация стандартных стрелок Swiper */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  width: 32px;
  height: 32px;
  margin-top: 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  svg {
    width: auto;
    height: auto;
  }
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

:deep(.swiper-button-next:after),
:deep(.swiper-button-prev:after) {
  font-size: 20px;
  font-weight: 700;
  color: #1f2933;
}

:deep(.swiper-button-prev) {
  left: 16px;
}

:deep(.swiper-button-next) {
  right: 16px;
}

:deep(.swiper-button-disabled) {
  opacity: 0.35;
  cursor: not-allowed;
}

:deep(.swiper-button-disabled:hover) {
  transform: scale(1);
  background: rgba(255, 255, 255, 0.9);
}

/* Стилизация пагинации */
:deep(.swiper-pagination) {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  z-index: 10;
}

:deep(.swiper-pagination-bullet) {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 2px solid #1e88e5;
  opacity: 1;
  margin: 0 6px;
  transition: all 0.3s ease;
}

:deep(.swiper-pagination-bullet-active) {
  background: #1e88e5;
  border: 2px solid #1e88e5;
  width: 32px;
  height: 12px;
  border-radius: 6px;
}

:deep(.swiper-pagination-bullet:hover) {
  background: rgba(255, 255, 255, 0.9);
}

:deep(.swiper-slide-thumb-active .thumb-image-wrapper) {
  border-color: #3b82f6;
}

.product-gallery-loading {
  width: 100%;
  max-width: 400px;
  min-width: 0;
  margin: 0 auto;
  box-sizing: border-box;
  overflow: hidden;
}

.loading-placeholder {
  width: 100%;
  height: 500px;
  background: #f5f5f5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-image {
  width: 200px;
  height: 200px;
  background: #e5e7eb;
  border-radius: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .main-swiper {
    height: 400px;
  }

  .thumbs-swiper {
    height: 50px;
  }

  .loading-placeholder {
    height: 400px;
  }
}

@media (max-width: 768px) {
  :deep(.thumbs-swiper .swiper-slide) {
    width: 80px !important;
  }
}

@media (max-width: 400px) {
  .product-gallery,
  .product-gallery-empty,
  .product-gallery-loading {
    max-width: 100%;
    width: 100%;
  }

  .product-gallery-empty {
    min-height: 260px;
  }

  .loading-placeholder {
    height: 280px;
  }

  /* Миниатюры: меньше слайды, чтобы влезали на узком экране */
  :deep(.thumbs-swiper .swiper-slide) {
    width: 60px !important;
  }

  .thumbs-swiper {
    height: 52px;
  }

  /* Swiper-контейнеры не должны растягивать сетку */
  .main-swiper :deep(.swiper-wrapper),
  .main-swiper :deep(.swiper-slide) {
    min-width: 0;
  }
}

/* Fullscreen Lightbox Styles */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.fullscreen-close {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10000;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
  }
}

.fullscreen-swiper {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100vh;
}

.fullscreen-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
  }
}

/* Fullscreen navigation buttons — синие для контраста на светлом фоне */
.fullscreen-overlay :deep(.swiper-button-next),
.fullscreen-overlay :deep(.swiper-button-prev) {
  width: 48px;
  height: 48px;
  background: rgba(30, 136, 229, 0.9);
  border: 2px solid #1e88e5;
  border-radius: 50%;
  color: white;
  transition: all 0.3s ease;

  &:hover {
    background: #1565c0;
    border-color: #1565c0;
    transform: scale(1.1);
  }

  &:after {
    font-size: 24px;
    font-weight: 700;
    color: white;
  }
}

.fullscreen-overlay :deep(.swiper-button-prev) {
  left: 20px;
}

.fullscreen-overlay :deep(.swiper-button-next) {
  right: 20px;
}

/* Fullscreen pagination */
.fullscreen-overlay :deep(.swiper-pagination) {
  bottom: 30px;
}

.fullscreen-overlay :deep(.swiper-pagination-bullet) {
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.7);
}

.fullscreen-overlay :deep(.swiper-pagination-bullet-active) {
  background: white;
  border-color: white;
}

@media (max-width: 768px) {
  .fullscreen-close {
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
  }

  .fullscreen-slide {
    padding: 20px;
  }

  .fullscreen-overlay :deep(.swiper-button-next),
  .fullscreen-overlay :deep(.swiper-button-prev) {
    width: 40px;
    height: 40px;
  }

  .fullscreen-overlay :deep(.swiper-button-prev) {
    left: 10px;
  }

  .fullscreen-overlay :deep(.swiper-button-next) {
    right: 10px;
  }
}
</style>
