<template>
  <div>
    <section class="section">
      <div class="card">
        <h1>{{ t('information.catalogsTitle') }}</h1>
        <p class="muted">
          {{ t('information.catalogsSubtitle') }}
        </p>
      </div>
    </section>

    <section class="section">
      <div class="grid">
        <div v-for="catalog in catalogs" :key="catalog.id" class="card catalog-card">
          <div class="catalog-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="catalog-content">
            <h3>{{ catalog.title }}</h3>
            <p class="muted">{{ catalog.description }}</p>
            <div class="catalog-meta">
              <span class="muted">{{ catalog.size }}</span>
              <span class="muted">{{ catalog.date }}</span>
            </div>
            <a 
              v-if="catalog.url" 
              :href="catalog.url" 
              target="_blank" 
              rel="noopener"
              class="btn primary"
              style="margin-top: 12px"
            >
              {{ t('information.downloadCatalog') }}
            </a>
            <button 
              v-else
              class="btn ghost"
              style="margin-top: 12px"
              disabled
            >
              {{ t('information.comingSoon') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="catalogs.length === 0" class="section">
      <div class="card">
        <p class="muted" style="text-align: center; padding: 40px 0;">
          {{ t('information.noCatalogs') }}
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const catalogs = ref([
  // Здесь можно добавить реальные каталоги
  // {
  //   id: 1,
  //   title: 'Каталог газоанализаторов 2024',
  //   description: 'Полный каталог продукции ФАРМЭК с техническими характеристиками',
  //   size: '5.2 MB',
  //   date: '2024-01-15',
  //   url: '/catalogs/catalog-2024.pdf'
  // }
]);
</script>

<style lang="scss" scoped>
.catalog-card {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(17, 24, 39, 0.15);
  }
}

.catalog-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(30, 136, 229, 0.1), rgba(30, 136, 229, 0.05));
  border-radius: 14px;
  margin-bottom: 20px;
  color: #1e88e5;

  svg {
    width: 32px;
    height: 32px;
  }
}

.catalog-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.catalog-meta {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 14px;
}

@media (max-width: 767.98px) {
  .catalog-card {
    margin-bottom: 20px;
  }
}
</style>
