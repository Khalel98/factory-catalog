<template>
  <div class="spacing">
    <section class="section">
      <div class="card">
        <h1>{{ t('information.reviewsTitle') }}</h1>
        <p class="muted">
          {{ t('information.reviewsSubtitle') }}
        </p>
      </div>
    </section>
    <section class="section">
      <div class="review-photos-grid">
        <button
          v-for="(img, index) in reviewImages"
          :key="index"
          type="button"
          class="review-photo-item"
          @click="openLightbox(index)"
        >
          <img :src="img" :alt="`Отзыв ${index + 1}`" loading="lazy" />
        </button>
      </div>
    </section>

    <!-- Fullscreen lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxOpen"
          class="lightbox-overlay"
          @click.self="closeLightbox"
        >
          <button type="button" class="lightbox-close" aria-label="Закрыть" @click="closeLightbox">
            ×
          </button>
          <button
            v-if="reviewImages.length > 1"
            type="button"
            class="lightbox-prev"
            aria-label="Предыдущее"
            @click.stop="prevImage"
          >
            ‹
          </button>
          <div class="lightbox-content">
            <img
              v-if="reviewImages[lightboxIndex]"
              :src="reviewImages[lightboxIndex]"
              :alt="`Отзыв ${lightboxIndex + 1}`"
              class="lightbox-img"
              @click.stop
            />
            <span class="lightbox-counter">{{ lightboxIndex + 1 }} / {{ reviewImages.length }}</span>
          </div>
          <button
            v-if="reviewImages.length > 1"
            type="button"
            class="lightbox-next"
            aria-label="Следующее"
            @click.stop="nextImage"
          >
            ›
          </button>
        </div>
      </Transition>
    </Teleport>

    <section class="section" >
      <div class="card highlight">
        <h3>{{ t('information.leaveReview') }}</h3>
        <p class="muted">
          {{ t('information.leaveReviewDesc') }}
        </p>
        <NuxtLink to="/contacts" class="btn primary" style="margin-top: 16px">
          {{ t('information.contactUs') }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const reviews = ref([
  // Здесь можно добавить реальные отзывы
]);

// Фото отзывов из app/assets/review-imgs (1.jpg … 39.jpg) по порядку
const imageModules = import.meta.glob<{ default: string }>('~/assets/review-imgs/*.jpg', { eager: true, import: 'default' });
const reviewImages = computed(() => {
  return Object.entries(imageModules)
    .sort(([a], [b]) => {
      const numA = parseInt(a.replace(/^.*?(\d+)\.jpg$/i, '$1'), 10) || 0;
      const numB = parseInt(b.replace(/^.*?(\d+)\.jpg$/i, '$1'), 10) || 0;
      return numA - numB;
    })
    .map(([, url]) => (typeof url === 'string' ? url : String((url as { default?: string })?.default ?? '')));
});

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

function openLightbox(index: number) {
  lightboxIndex.value = index;
  lightboxOpen.value = true;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxOpen.value = false;
  document.body.style.overflow = '';
}

function nextImage() {
  const len = reviewImages.value.length;
  if (len === 0) return;
  lightboxIndex.value = (lightboxIndex.value + 1) % len;
}

function prevImage() {
  const len = reviewImages.value.length;
  if (len === 0) return;
  lightboxIndex.value = (lightboxIndex.value - 1 + len) % len;
}

function onKeydown(e: KeyboardEvent) {
  if (!lightboxOpen.value) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<style lang="scss" scoped>
.section{
  margin-bottom: 25px;
}
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(17, 24, 39, 0.12);
  }
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.review-author {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #16396C;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: #1f2933;
    font-size: 16px;
  }
}

.review-rating {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.stars {
  display: flex;
  gap: 2px;
  font-size: 18px;
}

.star {
  color: #e5e7eb;
  
  &.filled {
    color: #f6ad55;
  }
}

.review-date {
  font-size: 13px;
}

.review-content {
  margin-bottom: 12px;
  line-height: 1.6;
  color: #1f2933;
}

.review-product {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  font-size: 14px;
}

/* Фото отзывов — 3 в ряд, прямоугольные 4:3, без обёртки и отступов */
.review-photos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin: 0;
  padding: 0;
}

.review-photo-item {
  aspect-ratio: 3 / 4;
  border: none;
  border-radius: 0;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  background: #f3f4f6;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(17, 24, 39, 0.18);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

@media (max-width: 767.98px) {
  .review-photos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767.98px) {
  .review-header {
    flex-direction: column;
  }

  .review-rating {
    align-items: flex-start;
    width: 100%;
  }
}
</style>

<style lang="scss">
/* Fullscreen lightbox — без scoped, т.к. контент в Teleport */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 64px;
}

.lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
}

.lightbox-prev,
.lightbox-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 36px;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
  flex-shrink: 0;
}

.lightbox-prev {
  left: 16px;
}

.lightbox-next {
  right: 16px;
}

.lightbox-prev:hover,
.lightbox-next:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-content {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.lightbox-img {
  max-width: 100%;
  max-height: calc(90vh - 32px);
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 4px;
}

.lightbox-counter {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
