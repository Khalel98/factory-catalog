<template>
  <div class="catalog-page spacing">
    <div class="catalog-layout">
      <CatalogSidebar />
      <div class="catalog-content-wrapper">
        <Breadcrumbs :items="breadcrumbItems" />
        <div class="catalog-content">
          <!-- Список товаров подкатегории: /catalog/parent/sub -->
          <template v-if="isSubcategoryList">
            <h2 v-if="subcategoryMeta">{{ getCategoryName(subcategoryMeta) }}</h2>
            <div class="products-grid">
              <div v-for="item in subcategoryProducts" :key="item.id" class="product-card">
                <div class="product-image-wrapper" v-if="item.images && item.images.length > 0">
                  <img :src="item.images[0]" :alt="item.name" class="product-image" />
                </div>
                <h3>{{ item.name }}</h3>
                <ul class="product-general-info" v-if="getProductGeneralInfo(item).length > 0">
                  <li v-for="(info, idx) in getProductGeneralInfo(item).slice(0, 3)" :key="idx">{{ info }}</li>
                </ul>
                <div class="product-info">
                  <span class="product-price" v-if="item.price">{{ t('catalog.priceFrom', { price: item.price }) }}</span>
                  <NuxtLink :to="`/catalog/${categorySlug}/${productId}/${item.id}`" class="btn primary" style="margin-top: 8px; padding: 8px 12px; font-size: 14px;">{{ t('catalog.more') }}</NuxtLink>
                </div>
              </div>
            </div>
          </template>
          <ProductDetailView
            v-else-if="product"
            :product="product"
            :category-id="categorySlug"
            @images-updated="(newImages) => { if (product) product.images = newImages; }"
          />
          <div v-else-if="!isSubcategoryList" class="product-not-found">
            <h1>{{ t('product.notFound') }}</h1>
            <p class="muted">{{ t('product.tryAnother') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const productId = computed(() => route.params.id);
const categorySlug = computed(() => route.params.slug);
const product = ref(null);
const categories = ref([]);
const isSubcategoryList = ref(false);
const subcategoryProducts = ref([]);
const subcategoryMeta = ref(null);

const { t, locale } = useI18n();

const loadCategories = async () => {
  try {
    const data = await $fetch("/data/categories.json");
    categories.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error loading categories:", error);
    categories.value = [];
  }
};

const getCategoryName = (category) => {
  if (!category) return t('catalog.categories');
  const currentLang = locale.value;
  if (currentLang === 'kk' && category.nameKK) return category.nameKK;
  return category.nameRU || t('catalog.categories');
};

const getProductGeneralInfo = (item) => {
  if (!item) return [];
  const currentLang = locale.value;
  if (currentLang === 'kk' && item.generalInfoKK?.length > 0) return item.generalInfoKK;
  return item.generalInfoRU || [];
};

const breadcrumbItems = computed(() => {
  const items = [
    { label: t('breadcrumbs.home'), to: "/" },
    { label: t('breadcrumbs.catalog'), to: "/catalog" },
  ];
  if (isSubcategoryList.value && subcategoryMeta.value) {
    const parent = categories.value.find((c) => c.id === categorySlug.value);
    if (parent) items.push({ label: getCategoryName(parent), to: `/catalog/${categorySlug.value}` });
    items.push({ label: getCategoryName(subcategoryMeta.value), to: null });
    return items;
  }
  if (!product.value) return items;
  const cat = categories.value.find((c) => c.id === categorySlug.value);
  if (cat) {
    if (cat.parentId) {
      const parentCat = categories.value.find((c) => c.id === cat.parentId);
      if (parentCat) items.push({ label: getCategoryName(parentCat), to: `/catalog/${parentCat.id}` });
    }
    items.push({ label: getCategoryName(cat), to: `/catalog/${cat.id}` });
  }
  items.push({ label: product.value.name, to: null });
  return items;
});

async function loadProduct() {
  const slug = categorySlug.value;
  const id = productId.value;
  if (!slug || id === undefined || id === null) return null;
  try {
    const categoryData = await $fetch(`/data/${slug}.json`);
    const list = Array.isArray(categoryData) ? categoryData : [];
    return list.find((p) => String(p.id) === String(id)) || null;
  } catch (e) {
    console.error('loadProduct error:', e);
    return null;
  }
}

async function loadProductForRoute() {
  await loadCategories();
  const slugVal = categorySlug.value;
  const idVal = productId.value;

  const cat = categories.value.find((c) => c.id === slugVal);
  if (cat?.parentId) {
    await navigateTo(`/catalog/${cat.parentId}/${slugVal}/${idVal}`, { replace: true });
    return;
  }

  const isSub = categories.value.some((c) => c.id === idVal && c.parentId === slugVal);
  if (isSub) {
    isSubcategoryList.value = true;
    subcategoryMeta.value = categories.value.find((c) => c.id === idVal);
    try {
      const data = await $fetch(`/data/${idVal}.json`);
      subcategoryProducts.value = Array.isArray(data) ? data : [];
    } catch {
      subcategoryProducts.value = [];
    }
    return;
  }

  isSubcategoryList.value = false;
  subcategoryProducts.value = [];
  subcategoryMeta.value = null;
  product.value = await loadProduct();
}

onMounted(() => {
  loadProductForRoute();
});

watch([() => route.params.slug, () => route.params.id], () => {
  isSubcategoryList.value = false;
  subcategoryProducts.value = [];
  subcategoryMeta.value = null;
  loadProductForRoute();
}, { immediate: false });
</script>

<style scoped>
.catalog-content-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
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
.product-card:hover .product-image { transform: scale(1.05); }
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
  color: #1e88e5;
  font-size: 1rem;
  line-height: 1;
  font-weight: 700;
}
.product-not-found { text-align: center; padding: 60px 20px; }
.product-not-found h1 { font-size: 2rem; font-weight: 700; margin: 0 0 16px 0; color: #1f2933; }
</style>
