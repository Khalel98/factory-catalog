<template>
  <div class="catalog-page spacing">
    <div class="search-page-layout">
      <Breadcrumbs :items="breadcrumbItems" />
      <div class="search-content">
        <h1 class="search-page-title">{{ t('search.title') }}</h1>

        <form class="search-page-form" @submit.prevent="submitSearch" role="search">
          <input
            v-model="localQuery"
            type="search"
            class="search-page-input"
            :placeholder="t('nav.searchPlaceholder')"
            :aria-label="t('nav.searchPlaceholder')"
          />
          <button type="submit" class="btn primary">{{ t('search.button') }}</button>
        </form>

        <div v-if="!searchQueryTrimmed" class="empty-state">
          <p class="muted">{{ t('search.noQuery') }}</p>
          <NuxtLink to="/catalog" class="btn primary">{{ t('catalog.title') }}</NuxtLink>
        </div>

        <div v-else-if="loading" class="catalog-content-loading">
          <CatalogPreloader type="grid" />
        </div>

        <div v-else-if="results.length === 0" class="empty-state">
          <p class="muted">{{ t('search.noResults', { query: searchQueryTrimmed }) }}</p>
          <NuxtLink to="/catalog" class="btn primary">{{ t('breadcrumbs.catalog') }}</NuxtLink>
        </div>

        <template v-else>
          <p class="search-results-count muted">{{ t('search.resultsCount', { count: results.length }) }}</p>
          <div class="products-grid">
            <div
              v-for="item in results"
              :key="item.product.id + '-' + item.categoryId"
              class="product-card"
            >
              <div
                class="product-image-wrapper"
                v-if="item.product.images && item.product.images.length > 0"
              >
                <img
                  :src="item.product.images[0]"
                  :alt="item.product.name"
                  class="product-image"
                />
              </div>
              <h3>{{ item.product.name }}</h3>
              <ul
                class="product-general-info"
                v-if="getProductGeneralInfo(item.product).length > 0"
              >
                <li
                  v-for="(info, index) in getProductGeneralInfo(item.product).slice(0, 3)"
                  :key="index"
                >
                  {{ info }}
                </li>
              </ul>
              <div class="product-info">
                <span class="product-price" v-if="item.product.price">
                  {{ t('catalog.priceFrom', { price: item.product.price }) }}
                </span>
                <NuxtLink
                  :to="productLink(item)"
                  class="btn primary"
                  style="margin-top: 8px; padding: 8px 12px; font-size: 14px;"
                >
                  {{ t('catalog.more') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t, locale } = useI18n();
const route = useRoute();

const searchQuery = computed(() => route.query.q || '');
const searchQueryTrimmed = computed(() => searchQuery.value.trim());

// Локальный ввод для формы на странице (удобно на мобильных)
const localQuery = ref('');

watch(searchQuery, (q) => {
  localQuery.value = q || '';
}, { immediate: true });

const router = useRouter();

function submitSearch() {
  const q = localQuery.value?.trim() || '';
  if (q) router.push({ path: '/search', query: { q } });
}

const categories = ref([]);
const results = ref([]);
const loading = ref(false);

const breadcrumbItems = computed(() => [
  { label: t('breadcrumbs.home'), to: '/' },
  { label: t('search.title'), to: null },
]);

const getProductGeneralInfo = (product) => {
  if (!product) return [];
  const currentLang = locale.value;
  if (currentLang === 'kk' && product.generalInfoKK?.length > 0) return product.generalInfoKK;
  return product.generalInfoRU || [];
};

function productLink(item) {
  const cat = item.category;
  const categoryId = item.categoryId;
  if (cat?.parentId) return `/catalog/${cat.parentId}/${categoryId}/${item.product.id}`;
  return `/catalog/${categoryId}/${item.product.id}`;
}

async function runSearch() {
  const q = searchQueryTrimmed.value;
  if (!q) {
    results.value = [];
    return;
  }
  loading.value = true;
  results.value = [];
  try {
    const cats = await $fetch('/data/categories.json');
    const categoriesList = Array.isArray(cats) ? cats : [];
    const queryLower = q.toLowerCase();
    const matches = [];

    for (const category of categoriesList) {
      const categoryId = category.id;
      try {
        const data = await $fetch(`/data/${categoryId}.json`);
        const list = Array.isArray(data) ? data : [];
        for (const product of list) {
          const name = product.name || '';
          if (name.toLowerCase().includes(queryLower)) {
            matches.push({ product, category, categoryId });
          }
        }
      } catch {
        // нет файла или ошибка — пропускаем
      }
    }

    results.value = matches;
  } catch (err) {
    console.error('Search error:', err);
    results.value = [];
  } finally {
    loading.value = false;
  }
}

watch([searchQueryTrimmed], () => {
  runSearch();
}, { immediate: true });
</script>

<style scoped>
.search-page-layout {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.search-content {
  min-height: 400px;
}

.search-page-title {
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 700;
  color: #1f2933;
}

.search-page-form {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-page-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 14px;
  font-size: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  color: #1f2933;
  outline: none;
}

.search-page-input:focus {
  border-color: #16396C;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.15);
}

.search-results-count {
  margin: 0 0 20px;
  font-size: 0.95rem;
}

.catalog-content-loading {
  width: 100%;
}

.product-image-wrapper {
  width: 100%;
  height: 150px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #f5f5f5;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-general-info {
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-general-info li {
  font-size: 0.8rem;
  line-height: 1.4;
  color: #52606d;
  padding-left: 14px;
  position: relative;
}

.product-general-info li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #16396C;
  font-size: 1rem;
  line-height: 1;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #52606d;
}

.empty-state .muted {
  margin-bottom: 16px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 991.98px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767.98px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
