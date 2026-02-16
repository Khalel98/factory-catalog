<template>
  <div class="spacing">
    <Breadcrumbs :items="breadcrumbItems" />
    <section class="section">
      <div class="card">
        <h1>{{ t('information.videosTitle') }}</h1>
        <p class="muted">
          {{ t('information.videosSubtitle') }}
        </p>
      </div>
    </section>

    <section
      v-for="section in videoSections"
      :key="section.id"
      class="video-section"
      :class="{ 'video-section_collapsible': isMobile, 'video-section_open': isMobile && expandedSections.has(section.id) }"
    >
      <button
        v-if="isMobile"
        type="button"
        class="video-section-header video-section-header_btn"
        :aria-expanded="expandedSections.has(section.id)"
        @click="toggleSection(section.id)"
      >
        <span class="video-section-title">{{ t(`information.${section.titleKey}`) }}</span>
        <span class="video-section-count">{{ section.videos.length }}</span>
        <svg class="video-section-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <h2 v-else class="section-title">{{ t(`information.${section.titleKey}`) }}</h2>
      <div v-show="!isMobile || expandedSections.has(section.id)" class="video-section-body">
        <div class="grid video-grid">
          <button
            v-for="(video, idx) in section.videos"
            :key="`${section.id}-${idx}`"
            type="button"
            class="card video-card"
            @click="openVideoModal(video)"
          >
            <div class="video-thumbnail">
              <img
                :src="getYoutubeThumbnail(video.url)"
                :alt="t('information.videoTitles.' + video.titleKey)"
                loading="lazy"
              />
              <div class="play-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
            <div class="video-content">
              <h3 class="video-title">{{ t('information.videoTitles.' + video.titleKey) }}</h3>
              <span class="video-link-label">{{ t('information.watchVideo') }}</span>
            </div>
          </button>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="videoModalOpen"
        class="video-modal-overlay"
        @click.self="closeVideoModal"
      >
        <div class="video-modal-content">
          <button
            type="button"
            class="video-modal-close"
            :aria-label="t('order.close')"
            @click="closeVideoModal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div v-if="selectedVideo" class="video-modal-frame-wrap">
            <iframe
              :src="getYoutubeEmbedUrl(selectedVideo.url)"
              title="YouTube video"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            />
            <p class="video-modal-title">{{ t('information.videoTitles.' + selectedVideo.titleKey) }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

useHead({
  title: computed(() => t('information.videosTitle'))
});

const breadcrumbItems = computed(() => [
  { label: t('breadcrumbs.home'), to: '/' },
  { label: t('breadcrumbs.information'), to: '/information' },
  { label: t('breadcrumbs.videos') }
]);

function getYoutubeThumbnail(url: string): string {
  const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([^&?/]+)/)?.[1];
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
}

function getYoutubeEmbedUrl(url: string): string {
  const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([^&?/]+)/)?.[1];
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : '';
}

const videoModalOpen = ref(false);
const selectedVideo = ref<{ titleKey: string; url: string } | null>(null);

const MOBILE_BREAKPOINT = 768;
const isMobile = ref(false);
const expandedSections = ref<Set<string>>(new Set());

function setMobile() {
  if (process.client) {
    isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
  }
}

function toggleSection(sectionId: string) {
  const next = new Set(expandedSections.value);
  if (next.has(sectionId)) next.delete(sectionId);
  else next.add(sectionId);
  expandedSections.value = next;
}

onMounted(() => {
  setMobile();
  if (process.client) {
    window.addEventListener('resize', setMobile);
    const firstId = videoSections.value[0]?.id;
    if (firstId) expandedSections.value = new Set([firstId]);
  }
});

onUnmounted(() => {
  if (process.client) window.removeEventListener('resize', setMobile);
});

watch(isMobile, (mobile) => {
  if (mobile && expandedSections.value.size === 0 && videoSections.value[0]?.id) {
    expandedSections.value = new Set([videoSections.value[0].id]);
  }
});

function openVideoModal(video: { titleKey: string; url: string }) {
  selectedVideo.value = video;
  videoModalOpen.value = true;
}

function closeVideoModal() {
  videoModalOpen.value = false;
  selectedVideo.value = null;
}

let escapeHandler: ((e: KeyboardEvent) => void) | null = null;
watch(videoModalOpen, (open) => {
  if (process.client) {
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      escapeHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeVideoModal(); };
      document.addEventListener('keydown', escapeHandler);
    } else if (escapeHandler) {
      document.removeEventListener('keydown', escapeHandler);
      escapeHandler = null;
    }
  }
});

const videoSections = ref([
  {
    id: 'unpacking',
    titleKey: 'videosSectionUnpacking',
    videos: [
      { titleKey: 'unpacking_0', url: 'https://youtu.be/dT_5fAQc_rU?si=XoGpAOElDuEHe2sc' },
      { titleKey: 'unpacking_1', url: 'https://youtu.be/kLwvtKaQdAg?si=qCou7v0elrZ8Brfk' },
      { titleKey: 'unpacking_2', url: 'https://youtube.com/shorts/eGctbBqwLsg' },
      { titleKey: 'unpacking_3', url: 'https://youtu.be/MDbeYwhij30?si=BVTveeY3PyEXr5pY' },
      { titleKey: 'unpacking_4', url: 'https://youtube.com/shorts/AQoucoMFEeU' },
      { titleKey: 'unpacking_5', url: 'https://youtube.com/shorts/w9wGZCAXQSg' },
      { titleKey: 'unpacking_6', url: 'https://youtube.com/shorts/XEHCPHT-8x8?si=uUmdpu8qg8ToLJm0' },
      { titleKey: 'unpacking_7', url: 'https://youtu.be/2ID2HrYv-jE?si=g018y3leTeTScqLH' },
      { titleKey: 'unpacking_8', url: 'https://youtu.be/rK2EkRPuJ4g' },
      { titleKey: 'unpacking_9', url: 'https://youtu.be/6KeVLOa0J64' },
      { titleKey: 'unpacking_10', url: 'https://youtu.be/fonWYIHz7dU' },
      { titleKey: 'unpacking_11', url: 'https://youtu.be/Z3dsJDeCMTw' },
      { titleKey: 'unpacking_12', url: 'https://youtu.be/jkD3A77_8o8' },
      { titleKey: 'unpacking_13', url: 'https://youtu.be/yh5cjFKy5V8' },
      { titleKey: 'unpacking_14', url: 'https://youtu.be/150Hf5he0XY' },
      { titleKey: 'unpacking_15', url: 'https://youtu.be/HCsCF7mdWRo' },
      { titleKey: 'unpacking_16', url: 'https://youtu.be/rtKPC_OJnsk' },
      { titleKey: 'unpacking_17', url: 'https://youtu.be/a6ZVJ-Vr-_8' },
      { titleKey: 'unpacking_18', url: 'https://youtu.be/K0vb_0uZXUg' },
    ],
  },
  {
    id: 'usage',
    titleKey: 'videosSectionUsage',
    videos: [
      { titleKey: 'usage_0', url: 'https://youtu.be/JGj8vc-3ZWA?si=Pahxb3IofiPtWPoM' },
      { titleKey: 'usage_1', url: 'https://youtu.be/pJwT-KB0Az0?si=_K-woVf0Zq7oGa8G' },
      { titleKey: 'usage_2', url: 'https://youtu.be/t6_e71T0qbE?si=t-Oe6AxrZlGJTh1B' },
      { titleKey: 'usage_3', url: 'https://youtu.be/uVoWEy4aVeQ?si=FlAyBJ8aRUIx9Nu6' },
      { titleKey: 'usage_4', url: 'https://youtu.be/ieqp4AE6s6s?si=XUhFkwp3JomiWFkK' },
      { titleKey: 'usage_5', url: 'https://youtu.be/ghPUzHWxSq4?si=cE_RfEm0Zhv1q5BF' },
    ],
  },
  {
    id: 'gas-settings',
    titleKey: 'videosSectionGasSettings',
    videos: [
      { titleKey: 'gas_0', url: 'https://youtu.be/CNDx3NmSyUk' },
      { titleKey: 'gas_1', url: 'https://youtu.be/4kPcSzJ1VbU' },
      { titleKey: 'gas_2', url: 'https://youtu.be/XA9QLMkMshs' },
      { titleKey: 'gas_3', url: 'https://youtu.be/tYTQrJHem8U' },
      { titleKey: 'gas_4', url: 'https://youtu.be/cR6Gutmc_FI' },
      { titleKey: 'gas_5', url: 'https://youtu.be/07BcAbltrVI' },
      { titleKey: 'gas_6', url: 'https://youtu.be/p5O3gGl_T44' },
      { titleKey: 'gas_7', url: 'https://youtu.be/WYc-ceSGvak' },
      { titleKey: 'gas_8', url: 'https://youtu.be/n1-vfUV61YE' },
      { titleKey: 'gas_9', url: 'https://youtu.be/yAfEPwaJ9Z8' },
    ],
  },
  {
    id: 'instructions',
    titleKey: 'videosSectionInstructions',
    videos: [
      { titleKey: 'instructions_0', url: 'https://youtube.com/shorts/KTorHEfPU9M' },
      { titleKey: 'instructions_1', url: 'https://youtube.com/shorts/wayFIwEWH50' },
      { titleKey: 'instructions_2', url: 'https://youtu.be/uCiJ6G09a_w' },
      { titleKey: 'instructions_3', url: 'https://youtu.be/hOd2wmNDUSo' },
      { titleKey: 'instructions_4', url: 'https://youtu.be/w0x8zLZ767Y' },
      { titleKey: 'instructions_5', url: 'https://youtu.be/dTOT8QdEf5I' },
      { titleKey: 'instructions_6', url: 'https://youtu.be/kssymXftOFI' },
      { titleKey: 'instructions_7', url: 'https://youtu.be/oTHsG8I7gFs' },
    ],
  },
  {
    id: 'reviews',
    titleKey: 'videosSectionReviews',
    videos: [
      { titleKey: 'reviews_0', url: 'https://youtu.be/ITk04uxS-s4?si=xXTob_czo_UevM1d' },
      { titleKey: 'reviews_1', url: 'https://youtu.be/LvqtvDYQdWw' },
      { titleKey: 'reviews_2', url: 'https://youtu.be/I93Upw77wTg' },
      { titleKey: 'reviews_3', url: 'https://youtu.be/F0WIDMuR3IY' },
      { titleKey: 'reviews_4', url: 'https://youtu.be/gAqRon3dNp0' },
      { titleKey: 'reviews_5', url: 'https://www.youtube.com/watch?v=kbkDDfz8DMQ' },
      { titleKey: 'reviews_6', url: 'https://youtu.be/JI3I5Ecl2vw' },
      { titleKey: 'reviews_7', url: 'https://youtu.be/AHBkkVo908Q' },
      { titleKey: 'reviews_8', url: 'https://youtu.be/jcaw-W-g0Tk' },
    ],
  },
  {
    id: 'farmek-life',
    titleKey: 'videosSectionFarmekLife',
    videos: [
      { titleKey: 'farmek_0', url: 'https://youtu.be/swz6yP7e-zE?si=uhjyFo8aK0t23paz' },
      { titleKey: 'farmek_1', url: 'https://youtu.be/yR1L6iEmfsQ?si=wDMFFsVOangdgkik' },
      { titleKey: 'farmek_2', url: 'https://youtube.com/shorts/RR5wiI7YwC4' },
      { titleKey: 'farmek_3', url: 'https://youtube.com/shorts/hyMHZZT1bVs' },
      { titleKey: 'farmek_4', url: 'https://youtu.be/OEgxlDEcHWM' },
      { titleKey: 'farmek_5', url: 'https://youtube.com/shorts/MYpIYVdvdVc' },
      { titleKey: 'farmek_6', url: 'https://youtube.com/shorts/r0KCC62Qa20' },
      { titleKey: 'farmek_7', url: 'https://youtube.com/shorts/9XVGqYIKfnk' },
      { titleKey: 'farmek_8', url: 'https://youtu.be/iEZpiufUNpI' },
    ],
  },
  {
    id: 'trace-locators',
    titleKey: 'videosSectionTraceLocators',
    videos: [
      { titleKey: 'trace_0', url: 'https://youtu.be/kLwvtKaQdAg?si=qCou7v0elrZ8Brfk' },
      { titleKey: 'trace_1', url: 'https://youtube.com/shorts/eGctbBqwLsg' },
      { titleKey: 'trace_2', url: 'https://youtu.be/TTBSlxZ9rEs?si=-oZQmHiEJcFZJUtd' },
      { titleKey: 'trace_3', url: 'https://youtu.be/F0WIDMuR3IY?si=jNhpCAZ_eGCU9mD9' },
      { titleKey: 'trace_4', url: 'https://youtu.be/38216n2Reqc' },
      { titleKey: 'trace_5', url: 'https://youtu.be/j18aX5xqdgY' },
      { titleKey: 'trace_6', url: 'https://youtu.be/17lrDvXhpPg' },
      { titleKey: 'trace_7', url: 'https://youtu.be/r1HNbMa1pIY' },
      { titleKey: 'trace_8', url: 'https://youtu.be/HpzGWbkK7DU' },
    ],
  },
]);
</script>

<style lang="scss" scoped>
.video-section {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text, #111827);
}

/* Mobile: collapsible section header */
.video-section-header_btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  margin: 0 0 0;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: var(--surface, #fff);
  color: inherit;
  font: inherit;
  font-size: 1rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: background 0.2s, box-shadow 0.2s;

  &:hover {
    background: var(--surface, #fff);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &:active {
    opacity: 0.95;
  }
}

.video-section-title {
  flex: 1;
  min-width: 0;
  line-height: 1.35;
}

.video-section-count {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(30, 136, 229, 0.12);
  color: var(--color-primary, #16396C);
  font-size: 0.8rem;
  font-weight: 600;
}

.video-section-chevron {
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.video-section_collapsible.video-section_open .video-section-chevron {
  transform: rotate(180deg);
}

.video-section-body {
  margin-top: 12px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.video-card {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  width: 100%;
  text-align: left;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 18px;
  background: var(--surface, #fff);
  cursor: pointer;
  font: inherit;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

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
  margin-bottom: 12px;
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
  gap: 4px;
}

.video-title {
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-link-label {
  font-size: 0.8rem;
  color: var(--color-primary, #16396C);
  font-weight: 500;
}

/* Video modal */
.video-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.video-modal-content {
  position: relative;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
}

.video-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.85);
  }
}

.video-modal-frame-wrap {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  height: 0;
  background: #000;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.video-modal-title {
  margin: 0;
  padding: 16px 20px;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text, #111827);
}

@media (max-width: 767.98px) {
  .video-section {
    margin-bottom: 12px;
  }

  .video-section:last-child {
    margin-bottom: 0;
  }

  .video-section-body {
    margin-top: 8px;
    padding-left: 0;
    padding-right: 0;
  }

  .video-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .video-card {
    padding: 14px;
  }

  .video-modal-overlay {
    padding: 12px;
  }

  .video-modal-content {
    max-height: 85vh;
  }
}
</style>
