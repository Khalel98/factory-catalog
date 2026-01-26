<template>
  <div class="catalog-page spacing">
    <!-- <div class="catalog-header">
      <h1>Каталог товаров</h1>
      <p class="muted">
        Газоанализаторы, сигнализаторы, течеискатели, сенсоры и сервисное
        оборудование для промышленных и бытовых объектов.
      </p>
    </div> -->
    <div class="catalog-layout">
      <CatalogSidebar @select="selectCategory" />
      <div class="catalog-content-wrapper">
        <Breadcrumbs :items="breadcrumbItems" />
        <div class="catalog-content">
          <div v-if="selectedCategory">
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
                    :to="`/catalog/${product.id}${selectedCategoryId ? '?category=' + selectedCategoryId : ''}`"
                    class="btn primary"
                    style="margin-top: 12px"
                    >{{ t('catalog.more') }}</NuxtLink
                  >
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p class="muted">{{ t('catalog.selectCategory') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.catalog-content-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.product-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 16px;
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
  margin: 0 0 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-general-info li {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #52606d;
  padding-left: 16px;
  position: relative;
}

.product-general-info li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #1e88e5;
  font-size: 1.2rem;
  line-height: 1;
  font-weight: 700;
}
</style>

<script setup>
const { t, locale } = useI18n();

const categories = ref([]);
const products = ref([]);
const selectedCategoryId = ref(null);
const selectedCategory = computed(() => {
  if (!selectedCategoryId.value) return null;
  return (
    categories.value.find((cat) => cat.id === selectedCategoryId.value) || null
  );
});

// Функция для получения локализованного названия категории
const getCategoryName = (category) => {
  if (!category) return '';
  const currentLang = locale.value;
  if (currentLang === 'en' && category.nameEN) {
    return category.nameEN;
  }
  if (currentLang === 'kk' && category.nameKK) {
    return category.nameKK;
  }
  // По умолчанию русское название
  return category.nameRU || '';
};

// Функция для получения локализованного generalInfo товара
const getProductGeneralInfo = (product) => {
  if (!product) return [];
  const currentLang = locale.value;
  if (currentLang === 'en' && product.generalInfoEN?.length > 0) {
    return product.generalInfoEN;
  }
  if (currentLang === 'kk' && product.generalInfoKK?.length > 0) {
    return product.generalInfoKK;
  }
  // По умолчанию русское
  return product.generalInfoRU || [];
};

const breadcrumbItems = computed(() => {
  const items = [
    { label: t('breadcrumbs.home'), to: "/" },
    { label: t('breadcrumbs.catalog'), to: "/catalog" },
  ];

  if (selectedCategory.value) {
    items.push({
      label: getCategoryName(selectedCategory.value),
      to: `/catalog?category=${selectedCategory.value.id}`,
    });
  }

  return items;
});

const loadCategories = async () => {
  try {
    const data = await $fetch("/data/categories.json");
    categories.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error loading categories:", error);
    categories.value = [];
  }
};


const loadProducts = async (categoryId) => {
  try {
    const category = categories.value.find((cat) => cat.id === categoryId);
    if (!category) {
      products.value = [];
      return;
    }
    
    // Имя файла генерируется автоматически: {id}.json
    const fileName = `${categoryId}.json`;
    const data = await $fetch(`/data/${fileName}`);
    products.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error loading products:", error);
    products.value = [];
  }
};

const selectCategory = async (categoryId) => {
  selectedCategoryId.value = categoryId;
  await loadProducts(categoryId);
};

const route = useRoute();

onMounted(async () => {
  await loadCategories();
  if (route.query.category) {
    await selectCategory(route.query.category);
  } else if (categories.value.length > 0) {
    await selectCategory(categories.value[0].id);
  }
});

watch(
  () => route.query.category,
  async (newCategoryId) => {
    if (newCategoryId && categories.value.length > 0) {
      await selectCategory(newCategoryId);
    }
  }
);
</script>
