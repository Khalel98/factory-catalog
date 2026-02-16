<template>
  <div class="catalog-page spacing">
    <div class="catalog-layout">
      <CatalogSidebar @select="selectCategory" />
      <div class="catalog-content-wrapper">
        <Breadcrumbs :items="breadcrumbItems" />
        <div class="catalog-content">
          <div v-if="notFound" class="empty-state">
            <p class="muted">{{ t('catalog.categoryNotFound') || 'Категория не найдена' }}</p>
            <NuxtLink to="/catalog" class="btn primary">{{ t('catalog.backToCatalog') || 'В каталог' }}</NuxtLink>
          </div>
          <div v-else-if="productsLoading" class="catalog-content-loading">
            <CatalogPreloader type="grid" />
          </div>
          <div v-else-if="selectedCategory">
            <h2>{{ getCategoryName(selectedCategory) }}</h2>
            <div class="products-grid">
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
                  <span class="product-price" v-if="product.price"
                    >{{ t('catalog.priceFrom', { price: product.price }) }}</span
                  >
                  <NuxtLink
                    :to="productLink(product.id)"
                    class="btn primary"
                    style="margin-top: 8px; padding: 8px 12px; font-size: 14px;"
                    >{{ t('catalog.more') }}</NuxtLink
                  >
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

const slug = computed(() => route.params.slug);

const categories = ref([]);
const products = ref([]);
const notFound = ref(false);
const productsLoading = ref(false);

const selectedCategory = computed(() => {
  if (!slug.value) return null;
  return categories.value.find((cat) => cat.id === slug.value) || null;
});

const getCategoryName = (category) => {
  if (!category) return '';
  const currentLang = locale.value;
  if (currentLang === 'kk' && category.nameKK) return category.nameKK;
  return category.nameRU || '';
};

const getProductGeneralInfo = (product) => {
  if (!product) return [];
  const currentLang = locale.value;
  if (currentLang === 'kk' && product.generalInfoKK?.length > 0) return product.generalInfoKK;
  return product.generalInfoRU || [];
};

const productLink = (productId) => {
  const cat = selectedCategory.value;
  if (cat?.parentId) return `/catalog/${cat.parentId}/${slug.value}/${productId}`;
  return `/catalog/${slug.value}/${productId}`;
};

const breadcrumbItems = computed(() => {
  const items = [
    { label: t('breadcrumbs.home'), to: '/' },
    { label: t('breadcrumbs.catalog'), to: '/catalog' },
  ];
  if (selectedCategory.value) {
    if (selectedCategory.value.parentId) {
      const parentCategory = categories.value.find(
        (cat) => cat.id === selectedCategory.value.parentId
      );
      if (parentCategory) {
        items.push({
          label: getCategoryName(parentCategory),
          to: `/catalog/${parentCategory.id}`,
        });
      }
    }
    items.push({
      label: getCategoryName(selectedCategory.value),
      to: `/catalog/${selectedCategory.value.id}`,
    });
  }
  return items;
});

const loadCategories = async () => {
  try {
    const data = await $fetch('/data/categories.json');
    categories.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading categories:', error);
    categories.value = [];
  }
};

const loadProducts = async (categoryId) => {
  productsLoading.value = true;
  try {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) {
      products.value = [];
      return;
    }
    if (category.parentId) {
      try {
        const data = await $fetch(`/data/${categoryId}.json`);
        products.value = Array.isArray(data) ? data : [];
      } catch {
        products.value = [];
      }
      return;
    }
    try {
      const data = await $fetch(`/data/${categoryId}.json`);
      products.value = Array.isArray(data) ? data : [];
    } catch {
      products.value = [];
    }
  } catch (error) {
    console.error('Error loading products:', error);
    products.value = [];
  } finally {
    productsLoading.value = false;
  }
};

const selectCategory = (categoryId) => {
  if (!categoryId) {
    router.push('/catalog');
    return;
  }
  const cat = categories.value.find((c) => c.id === categoryId);
  if (cat?.parentId) router.push(`/catalog/${cat.parentId}/${categoryId}`);
  else router.push(`/catalog/${categoryId}`);
};

async function findProductById(id) {
  for (const cat of categories.value) {
    try {
      const data = await $fetch(`/data/${cat.id}.json`);
      const list = Array.isArray(data) ? data : [];
      const found = list.find((p) => p.id === id);
      if (found) return { product: found, categoryId: cat.id };
    } catch (e) {
      // skip
    }
  }
  return null;
}

onMounted(async () => {
  await loadCategories();
  if (!slug.value) return;
  const category = categories.value.find((cat) => cat.id === slug.value);
  if (category) {
    if (category.parentId) {
      await navigateTo(`/catalog/${category.parentId}/${slug.value}`, { replace: true });
      return;
    }
    await loadProducts(slug.value);
    return;
  }
  const found = await findProductById(slug.value);
  if (found) {
    const cat = categories.value.find((c) => c.id === found.categoryId);
    if (cat?.parentId) await navigateTo(`/catalog/${cat.parentId}/${found.categoryId}/${slug.value}`, { replace: true });
    else await navigateTo(`/catalog/${found.categoryId}/${slug.value}`, { replace: true });
    return;
  }
  notFound.value = true;
});

watch(slug, async (newSlug) => {
  if (!newSlug) return;
  const category = categories.value.find((cat) => cat.id === newSlug);
  notFound.value = !category;
  if (category && !category.parentId) {
    await loadProducts(newSlug);
  } else if (!category) {
    productsLoading.value = false;
  }
});
</script>

<style lang="css" scoped>
.catalog-content-wrapper {
  display: flex;
  flex-direction: column;
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

.catalog-content-loading {
  width: 100%;
}
</style>
