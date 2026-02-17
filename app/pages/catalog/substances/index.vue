<template>
  <div class="catalog-page spacing">
    <div class="catalog-layout">
      <CatalogSidebar @select="selectCategory" />
      <div class="catalog-content-wrapper">
        <Breadcrumbs :items="breadcrumbItems" />
        <div class="catalog-content">
          <h2>{{ t('home.selection') || 'Подбор веществ' }}</h2>
          <p class="muted">{{ t('home.selectionDesc') || 'Выберите вещество для просмотра подходящего оборудования.' }}</p>
          <div class="substances-grid">
            <NuxtLink
              v-for="sub in substances"
              :key="sub.id"
              :to="`/catalog/substances/${sub.id}`"
              class="substance-card card"
            >
              <h3 class="substance-card-title">{{ locale === 'kk' && sub.nameKz ? sub.nameKz : sub.name }}</h3>
              <p v-if="(locale === 'kk' ? sub.descriptionKz : sub.description)" class="substance-card-desc muted">{{ locale === 'kk' && sub.descriptionKz ? sub.descriptionKz : sub.description }}</p>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t, locale } = useI18n();
const substances = ref([]);

const breadcrumbItems = computed(() => [
  { label: t('breadcrumbs.home'), to: '/' },
  { label: t('breadcrumbs.catalog'), to: '/catalog' },
  { label: t('breadcrumbs.substances'), to: '/catalog/substances' },
]);

const loadSubstances = async () => {
  try {
    const data = await $fetch('/data/substances.json');
    substances.value = Array.isArray(data) ? data : [];
  } catch {
    substances.value = [];
  }
};

const selectCategory = (categoryId) => {
  if (!categoryId) navigateTo('/catalog');
  else navigateTo(`/catalog/${categoryId}`);
};

onMounted(loadSubstances);
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
