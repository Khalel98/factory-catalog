<template>
  <div class="catalog-page spacing">
    <div class="catalog-layout">
      <CatalogSidebar @select="selectCategory" />
      <div class="catalog-content-wrapper">
        <Breadcrumbs :items="breadcrumbItems" />
        <div class="catalog-content">
          <h2>{{ t('home.selectionByApplication') }}</h2>
          <p class="muted">{{ t('home.selectionByApplicationDesc') }}</p>
          <div class="substances-grid">
            <NuxtLink
              v-for="app in applications"
              :key="app.id"
              :to="`/catalog/applications/${app.id}`"
              class="substance-card card"
            >
              <h3 class="substance-card-title">{{ locale === 'kk' && app.nameKz ? app.nameKz : app.name }}</h3>
              <p v-if="(locale === 'kk' ? app.descriptionKz : app.description)" class="substance-card-desc muted">{{ locale === 'kk' && app.descriptionKz ? app.descriptionKz : app.description }}</p>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t, locale } = useI18n();
const applications = ref([]);

const breadcrumbItems = computed(() => [
  { label: t('breadcrumbs.home'), to: '/' },
  { label: t('breadcrumbs.catalog'), to: '/catalog' },
  { label: t('breadcrumbs.applications'), to: '/catalog/applications' },
]);

const loadApplications = async () => {
  try {
    const data = await $fetch('/data/applications.json');
    applications.value = Array.isArray(data) ? data : [];
  } catch {
    applications.value = [];
  }
};

const selectCategory = (categoryId) => {
  if (!categoryId) navigateTo('/catalog');
  else navigateTo(`/catalog/${categoryId}`);
};

onMounted(loadApplications);
</script>

<style scoped>
.substances-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 24px;
}
.substance-card {
  display: block;
  text-decoration: none;
  color: inherit;
  padding: 20px;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.substance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
.substance-card-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1f2933;
}
.substance-card-desc {
  font-size: 13px;
  margin: 0;
  line-height: 1.4;
}
</style>
