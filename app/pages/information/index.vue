<template>
  <div class="spacing">
    <section class="section">
      <div class="card">
        <h1>{{ t('information.title') }}</h1>
        <p class="muted">
          {{ t('information.subtitle') }}
        </p>
      </div>
    </section>

    <section class="section">
      <div class="info-cards grid">
        <NuxtLink
          v-for="card in infoCards"
          :key="card.to"
          :to="card.to"
          class="card info-card"
        >
          <div class="info-card-icon">
            <component :is="card.icon" />
          </div>
          <h3 class="info-card-title">{{ t(card.titleKey) }}</h3>
          <p class="muted info-card-desc">{{ t(card.descKey) }}</p>
          <span class="btn primary info-card-btn">{{ t('information.more') }}</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';

const { t } = useI18n();

const IconVideo = () => h('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('polygon', { points: '23 7 16 12 23 17 23 7' }),
  h('rect', { x: '1', y: '5', width: '15', height: '14', rx: '2', ry: '2' })
]);

const IconReviews = () => h('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
]);

const IconDocumentation = () => h('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
  h('polyline', { points: '14 2 14 8 20 8' }),
  h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
  h('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
  h('polyline', { points: '10 9 9 9 8 9' })
]);

const infoCards = [
  {
    to: '/information/videos',
    titleKey: 'nav.videos',
    descKey: 'information.videosCardDesc',
    icon: IconVideo
  },
  {
    to: '/information/reviews',
    titleKey: 'nav.reviews',
    descKey: 'information.reviewsCardDesc',
    icon: IconReviews
  },
  {
    to: '/information/documentation',
    titleKey: 'nav.documentation',
    descKey: 'information.documentationCardDesc',
    icon: IconDocumentation
  }
];
</script>

<style scoped>
.info-cards {
  --min-card: 280px;
}

.info-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s, transform 0.2s;
}

.info-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.info-card-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  color: var(--color-primary, #16396C);
}

.info-card-icon svg {
  width: 100%;
  height: 100%;
}

.info-card-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.info-card-desc {
  margin: 0 0 1rem;
  flex-grow: 1;
}

.info-card-btn {
  display: inline-block;
  margin-top: auto;
}
</style>
