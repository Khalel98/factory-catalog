<template>
  <div class="catalog-page spacing">
    <div class="catalog-layout">
      <CatalogSidebar @select="selectCategory" />
      <div class="catalog-content-wrapper">
        <Breadcrumbs :items="breadcrumbItems" />
        <div class="catalog-content">
          <div v-if="notFound" class="empty-state">
            <p class="muted">{{ t('catalog.categoryNotFound') || 'Вещество не найдено' }}</p>
            <NuxtLink to="/catalog/substances" class="btn primary">{{ t('catalog.backToCatalog') || 'К подбору веществ' }}</NuxtLink>
          </div>
          <div v-else-if="productsLoading" class="catalog-content-loading">
            <CatalogPreloader type="grid" />
          </div>
          <div v-else-if="substance">
            <h2>{{ locale === 'kk' && substance.nameKz ? substance.nameKz : substance.name }}</h2>
            <p v-if="(locale === 'kk' ? substance.descriptionKz : substance.description)" class="substance-desc muted">{{ locale === 'kk' && substance.descriptionKz ? substance.descriptionKz : substance.description }}</p>
            <div v-if="products.length === 0" class="empty-state">
              <p class="muted">Товары для данного вещества пока не добавлены.</p>
            </div>
            <div v-else class="products-grid">
              <div
                v-for="product in products"
                :key="product.id"
                class="product-card"
              >
                <div
                  class="product-image-wrapper"
                  v-if="product.images && product.images.length > 0"
                >
                  <img
                    :src="product.images[0]"
                    :alt="product.name"
                    class="product-image"
                  />
                </div>
                <h3>{{ product.name }}</h3>
                <ul
                  class="product-general-info"
                  v-if="getProductGeneralInfo(product).length > 0"
                >
                  <li
                    v-for="(item, index) in getProductGeneralInfo(product).slice(0, 3)"
                    :key="index"
                  >
                    {{ item }}
                  </li>
                </ul>
                <div class="product-info">
                  <span class="product-price" v-if="product.price">{{ t('catalog.priceFrom', { price: product.price }) }}</span>
                  <NuxtLink
                    :to="productLink(product)"
                    class="btn primary"
                    style="margin-top: 8px; padding: 8px 12px; font-size: 14px;"
                  >{{ t('catalog.more') }}</NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const substanceId = computed(() => route.params.substanceId);

const substances = ref([]);
const substance = computed(() => substances.value.find((s) => s.id === substanceId.value) || null);
const products = ref([]);
const notFound = ref(false);
const productsLoading = ref(false);
const categories = ref([]);

const getProductGeneralInfo = (product) => {
  if (!product) return [];
  const currentLang = locale.value;
  if (currentLang === 'kk' && product.generalInfoKK?.length > 0) return product.generalInfoKK;
  return product.generalInfoRU || [];
};

const productLink = (product) => {
  const catId = product._categoryId;
  if (!catId) return `/catalog/portable-devices/${product.id}`;
  const cat = categories.value.find((c) => c.id === catId);
  if (cat?.parentId) return `/catalog/${cat.parentId}/${catId}/${product.id}`;
  return `/catalog/${catId}/${product.id}`;
};

const breadcrumbItems = computed(() => {
  const items = [
    { label: t('breadcrumbs.home'), to: '/' },
    { label: t('breadcrumbs.catalog'), to: '/catalog' },
    { label: t('breadcrumbs.substances'), to: '/catalog/substances' },
  ];
  if (substance.value) {
    const name = locale.value === 'kk' && substance.value.nameKz
      ? substance.value.nameKz
      : substance.value.name;
    items.push({
      label: name,
      to: `/catalog/substances/${substance.value.id}`,
    });
  }
  return items;
});

const loadSubstances = async () => {
  try {
    const data = await $fetch('/data/substances.json');
    substances.value = Array.isArray(data) ? data : [];
  } catch {
    substances.value = [];
  }
};

const loadCategories = async () => {
  try {
    const data = await $fetch('/data/categories.json');
    categories.value = Array.isArray(data) ? data : [];
  } catch {
    categories.value = [];
  }
};

async function findProductsByIds(productIds) {
  const result = [];
  const seenIds = new Set();
  for (const cat of categories.value) {
    if (cat.parentId) continue;
    try {
      const data = await $fetch(`/data/${cat.id}.json`);
      const list = Array.isArray(data) ? data : [];
      for (const p of list) {
        if (productIds.includes(p.id) && !seenIds.has(p.id)) {
          seenIds.add(p.id);
          result.push({ ...p, _categoryId: cat.id });
        }
      }
    } catch {
      // skip
    }
  }
  for (const cat of categories.value.filter((c) => c.parentId)) {
    try {
      const data = await $fetch(`/data/${cat.id}.json`);
      const list = Array.isArray(data) ? data : [];
      for (const p of list) {
        if (productIds.includes(p.id) && !seenIds.has(p.id)) {
          seenIds.add(p.id);
          result.push({ ...p, _categoryId: cat.id });
        }
      }
    } catch {
      // skip
    }
  }
  return result;
}

const loadProducts = async () => {
  productsLoading.value = true;
  try {
    const sub = substances.value.find((s) => s.id === substanceId.value);
    if (!sub) {
      products.value = [];
      notFound.value = true;
      return;
    }
    notFound.value = false;
    const ids = sub.productIds || [];
    if (ids.length === 0) {
      products.value = [];
      return;
    }
    const found = await findProductsByIds(ids);
    // Сортируем по порядку в списке productIds
    const orderMap = Object.fromEntries(ids.map((id, i) => [id, i]));
    products.value = found.sort((a, b) => {
      const ia = orderMap[a.id] ?? 9999;
      const ib = orderMap[b.id] ?? 9999;
      return ia - ib;
    });
  } catch (error) {
    console.error('Error loading substance products:', error);
    products.value = [];
  } finally {
    productsLoading.value = false;
  }
};

const selectCategory = (categoryId) => {
  if (!categoryId) router.push('/catalog');
  else {
    const cat = categories.value.find((c) => c.id === categoryId);
    if (cat?.parentId) router.push(`/catalog/${cat.parentId}/${categoryId}`);
    else router.push(`/catalog/${categoryId}`);
  }
};

onMounted(async () => {
  await Promise.all([loadSubstances(), loadCategories()]);
  if (!substance.value) notFound.value = true;
  else await loadProducts();
});

watch(substanceId, async () => {
  if (!substanceId.value) return;
  if (!substance.value) notFound.value = true;
  else await loadProducts();
});
</script>

<style scoped>
.catalog-content-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.substance-desc {
  margin-bottom: 24px;
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
.catalog-content-loading {
  width: 100%;
}
</style>
