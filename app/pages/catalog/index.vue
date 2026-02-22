<template>
  <div class="catalog-page spacing">
    <div class="catalog-layout">
      <CatalogSidebar @select="selectCategory" />
      <div class="catalog-content-wrapper">
        <Breadcrumbs :items="breadcrumbItems" />
        <div class="catalog-content">
          <section class="section catalog-section">
            <h2 class="catalog-section-title">{{ t('home.catalogCategories') }}</h2>
            <p class="catalog-section-desc muted">{{ t('home.catalogDesc') }}</p>
            <div class="catalog-grid">
              <NuxtLink
                v-for="cat in catalogCategories"
                :key="cat.slug"
                :to="`/catalog/${cat.slug}`"
                class="catalog-card card"
              >
                <div class="catalog-card-image-wrap">
                  <img :src="cat.image" :alt="cat.title" class="catalog-card-image" />
                </div>
                <h3 class="catalog-card-title">{{ cat.title }}</h3>
              </NuxtLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.catalog-content-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.catalog-section {
  :deep(.catalog-section-title) {
    font-size: 28px;
    font-weight: 700;
    color: #1f2933;
    margin-bottom: 12px;
    text-align: center;
  }

  :deep(.catalog-section-desc) {
    text-align: center;
    margin-bottom: 32px;
    max-width: 560px;
    margin-left: auto;
    margin-right: auto;
  }

  :deep(.catalog-grid) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 32px;
  }

  :deep(.catalog-card) {
    display: block;
    text-decoration: none;
    color: inherit;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    padding: 0;
    border-radius: 14px;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(17, 24, 39, 0.15);
    }
  }

  :deep(.catalog-card-image-wrap) {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: #f1f5f9;
  }

  :deep(.catalog-card-image) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  :deep(.catalog-card:hover .catalog-card-image) {
    transform: scale(1.05);
  }

  :deep(.catalog-card-title) {
    font-size: 15px;
    font-weight: 600;
    color: #1f2933;
    padding: 16px;
    margin: 0;
    line-height: 1.35;
  }
}

@media (max-width: 1024px) {
  .catalog-section :deep(.catalog-grid) {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 767.98px) {
  .catalog-section {
    :deep(.catalog-section-title) {
      font-size: 22px;
    }

    :deep(.catalog-grid) {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }

    :deep(.catalog-card-title) {
      font-size: 13px;
      padding: 12px;
    }
  }
}
</style>

<script setup>
const { t } = useI18n();

import catalogImg1 from '@/assets/catalog-img/1.jpg';
import catalogImg2 from '@/assets/catalog-img/2.jpg';
import catalogImg3 from '@/assets/catalog-img/3.jpg';
import catalogImg4 from '@/assets/catalog-img/4.jpg';
import catalogImg5 from '@/assets/catalog-img/5.jpg';
import catalogImg6 from '@/assets/catalog-img/6.jpg';
import catalogImg7 from '@/assets/catalog-img/7.jpg';
import catalogImg8 from '@/assets/catalog-img/8.jpg';
import catalogImg9 from '@/assets/catalog-img/9.jpg';
import catalogImg10 from '@/assets/catalog-img/10.jpg';

const catalogCategoriesBase = [
  { slug: 'trassoiskateli', image: catalogImg1 },
  { slug: 'gazoanalizatory-stacionarnye', image: catalogImg2 },
  { slug: 'portable-devices', image: catalogImg3 },
  { slug: 'techeiskateli', image: catalogImg4 },
  { slug: 'izmeriteli-davlenija-gaza', image: catalogImg5 },
  { slug: 'signalizatory-zagazovannosti-bytovye', image: catalogImg6 },
  { slug: 'prochie-izmeritelnye-sistemy', image: catalogImg7 },
  { slug: 'service-devices', image: catalogImg8 },
  { slug: 'sensors/gazovye-sensory', image: catalogImg9 },
  { slug: 'accessories', image: catalogImg10 },
];

const catalogCategories = computed(() =>
  catalogCategoriesBase.map((cat) => ({
    ...cat,
    title: t('home.catalogCategoryTitles.' + cat.slug) || cat.slug,
  }))
);

const breadcrumbItems = computed(() => [
  { label: t('breadcrumbs.home'), to: '/' },
  { label: t('breadcrumbs.catalog'), to: '/catalog' },
]);

const selectCategory = (categoryId) => {
  navigateTo(`/catalog/${categoryId}`);
};
</script>
