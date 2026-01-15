<template>
  <div>
    <section class="section">
      <div class="card">
        <h1>{{ t('information.videosTitle') }}</h1>
        <p class="muted">
          {{ t('information.videosSubtitle') }}
        </p>
      </div>
    </section>

    <section class="section">
      <div class="grid">
        <div v-for="video in videos" :key="video.id" class="card video-card">
          <div class="video-thumbnail" v-if="video.thumbnail">
            <img :src="video.thumbnail" :alt="video.title" />
            <div class="play-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>
          <div class="video-content">
            <h3>{{ video.title }}</h3>
            <p class="muted">{{ video.description }}</p>
            <div class="video-meta">
              <span class="muted">{{ video.duration }}</span>
              <span class="muted">{{ video.date }}</span>
            </div>
            <a 
              v-if="video.url" 
              :href="video.url" 
              target="_blank" 
              rel="noopener"
              class="btn primary"
              style="margin-top: 12px"
            >
              {{ t('information.watchVideo') }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <section v-if="videos.length === 0" class="section">
      <div class="card">
        <p class="muted" style="text-align: center; padding: 40px 0;">
          {{ t('information.noVideos') }}
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const videos = ref([
  // Здесь можно добавить реальные видео
  // {
  //   id: 1,
  //   title: 'Обзор газоанализатора ФП23',
  //   description: 'Подробный обзор возможностей и функций прибора',
  //   thumbnail: 'https://via.placeholder.com/400x225',
  //   duration: '15:30',
  //   date: '2024-01-15',
  //   url: 'https://www.youtube.com/watch?v=example'
  // }
]);
</script>

<style lang="scss" scoped>
.video-card {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(17, 24, 39, 0.15);
  }
}

.video-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 16px;
  background: #f5f5f5;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  .play-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 64px;
    height: 64px;
    background: rgba(30, 136, 229, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s ease;

    svg {
      margin-left: 4px;
    }
  }

  &:hover .play-overlay {
    background: rgba(30, 136, 229, 1);
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.video-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-meta {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 14px;
}

@media (max-width: 767.98px) {
  .video-card {
    margin-bottom: 20px;
  }
}
</style>
