<template>
  <div class="catalog-page spacing">
    <div class="catalog-layout">
      <CatalogSidebar />
      <div class="catalog-content-wrapper">
        <Breadcrumbs v-if="product" :items="breadcrumbItems" />
        <div class="catalog-content">
          <ProductDetailView
            v-if="product"
            :product="product"
            :category-id="categorySlug"
            @images-updated="(newImages) => { if (product) product.images = newImages; }"
          />
          <div v-else class="product-not-found">
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
const parentSlug = computed(() => route.params.slug);
const categorySlug = computed(() => route.params.subslug);
const product = ref(null);
const categories = ref([]);

const { t, locale } = useI18n();

const getCategoryName = (category) => {
  if (!category) return t('catalog.categories');
  return locale.value === 'kk' && category.nameKK ? category.nameKK : (category.nameRU || t('catalog.categories'));
};

const breadcrumbItems = computed(() => {
  if (!product.value) return [];
  const items = [
    { label: t('breadcrumbs.home'), to: "/" },
    { label: t('breadcrumbs.catalog'), to: "/catalog" },
  ];
  if (parentSlug.value) {
    const parent = categories.value.find((c) => c.id === parentSlug.value);
    if (parent) items.push({ label: getCategoryName(parent), to: `/catalog/${parent.id}` });
  }
  if (categorySlug.value) {
    const cat = categories.value.find((c) => c.id === categorySlug.value);
    if (cat) items.push({ label: getCategoryName(cat), to: `/catalog/${parentSlug.value}/${cat.id}` });
  }
  items.push({ label: product.value.name, to: null });
  return items;
});

const loadCategories = async () => {
  try {
    const data = await $fetch("/data/categories.json");
    categories.value = Array.isArray(data) ? data : [];
  } catch (error) {
    categories.value = [];
  }
};

async function loadProduct() {
  const slug = categorySlug.value;
  const id = productId.value;
  if (!slug || id === undefined || id === null) return null;
  try {
    const categoryData = await $fetch(`/data/${slug}.json`);
    const list = Array.isArray(categoryData) ? categoryData : [];
    return list.find((p) => String(p.id) === String(id)) || null;
  } catch (e) {
    return null;
  }
}

async function loadProductForRoute() {
  await loadCategories();
  product.value = await loadProduct();
}

onMounted(() => {
  loadProductForRoute();
});

watch([() => route.params.slug, () => route.params.subslug, () => route.params.id], () => {
  loadProductForRoute();
}, { immediate: false });
</script>

<style scoped>
.catalog-content-wrapper { display: flex; flex-direction: column; width: 100%; min-width: 0; }
.product-not-found { text-align: center; padding: 60px 20px; }
.product-not-found h1 { font-size: 2rem; font-weight: 700; margin: 0 0 16px 0; color: #1f2933; }
</style>
