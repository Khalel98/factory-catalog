<template>
  <div class="catalog-page">
    <!-- <div class="catalog-header">
      <h1>Каталог товаров</h1>
      <p class="muted">
        Газоанализаторы, сигнализаторы, течеискатели, сенсоры и сервисное
        оборудование для промышленных и бытовых объектов.
      </p>
    </div> -->
    <div class="catalog-layout">
      <CatalogSidebar />
      <div class="catalog-content-wrapper">
        <Breadcrumbs v-if="product" :items="breadcrumbItems" />
        <div class="catalog-content">
          <div class="product-detail-page" v-if="product">
            <div class="product-detail-layout">
              <div class="product-gallery-section">
                <ProductGallery
                  :images="product.images || []"
                  :product-name="product.name"
                  :product-id="product.id"
                  :category-id="productCategory"
                  @images-updated="handleImagesUpdated"
                />
              </div>

              <div class="product-info-section">
                <h2 class="section-title">{{ t('product.generalInfo') }}</h2>
                <ul
                  class="general-info-list"
                  v-if="getGeneralInfo().length > 0"
                >
                  <li v-for="(item, index) in getGeneralInfo()" :key="index">
                    {{ item }}
                  </li>
                </ul>
                <button class="order-button" @click="openOrderModal">
                  {{ t('product.order') }}
                </button>
              </div>

              <OrderModal
                :is-open="isOrderModalOpen"
                :product-name="product?.name || ''"
                @close="closeOrderModal"
                @submit="handleOrderSubmit"
              />

              <div class="product-tabs-section">
                <div class="tabs-header">
                  <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    :class="['tab-button', { active: activeTab === tab.id }]"
                    @click="activeTab = tab.id"
                    :aria-selected="activeTab === tab.id"
                    role="tab"
                  >
                    {{ tab.label }}
                  </button>
                </div>
                <div class="tabs-content" role="tabpanel">
                  <DescriptionTab
                    v-if="activeTab === 'description'"
                    :description="getDescription()"
                    :description-r-u="product?.descriptionRU || ''"
                    :description-e-n="product?.descriptionEN || ''"
                    :description-k-k="product?.descriptionKK || ''"
                    :product-id="product?.id || ''"
                    :category-id="productCategory || ''"
                  />
                  <DocumentationTab 
                    v-if="activeTab === 'documentation'"
                    :product-id="product?.id || ''"
                    :category-id="productCategory || ''"
                  />
                  <VideoTab 
                    v-if="activeTab === 'video'"
                    :product-id="product?.id || ''"
                    :category-id="productCategory || ''"
                  />
                  <KitTab 
                    v-if="activeTab === 'kit'"
                    :kit="getKit()"
                    :kit-r-u="product?.kitRU || ''"
                    :kit-e-n="product?.kitEN || ''"
                    :kit-k-k="product?.kitKK || ''"
                    :product-id="product?.id || ''"
                    :category-id="productCategory || ''"
                  />
                  <PriceComplectationTab 
                    v-if="activeTab === 'price-complectation'"
                    :content="product?.priceComplectationInfo || ''"
                  />
                  <SpecificationsTab v-if="activeTab === 'specifications'" />
                  <CompatibilityTab v-if="activeTab === 'compatibility'" />
                </div>
              </div>
            </div>
          </div>
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
import DescriptionTab from "@/components/product-tabs/DescriptionTab.vue";
import DocumentationTab from "@/components/product-tabs/DocumentationTab.vue";
import VideoTab from "@/components/product-tabs/VideoTab.vue";
import KitTab from "@/components/product-tabs/KitTab.vue";
import PriceComplectationTab from "@/components/product-tabs/PriceComplectationTab.vue";
import SpecificationsTab from "@/components/product-tabs/SpecificationsTab.vue";
import CompatibilityTab from "@/components/product-tabs/CompatibilityTab.vue";

const route = useRoute();
const router = useRouter();
const productId = route.params.id;
const product = ref(null);
const productCategory = ref(null);
const categories = ref([]);
const isOrderModalOpen = ref(false);
const activeTab = ref("documentation");

const { t, locale } = useI18n();

const tabs = computed(() => [
  { id: "documentation", label: t('tabs.documentation') },
  { id: "price-complectation", label: t('tabs.priceComplectation') },
  { id: "description", label: t('tabs.description') },
  { id: "specifications", label: t('tabs.specifications') },
  { id: "kit", label: t('tabs.kit') },
  { id: "video", label: t('tabs.video') },
  { id: "compatibility", label: t('tabs.compatibility') },
]);

const loadCategories = async () => {
  try {
    const data = await $fetch("/data/categories.json");
    categories.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error loading categories:", error);
    categories.value = [];
  }
};

// Функция для получения локализованного названия категории
const getCategoryName = (category) => {
  if (!category) return t('catalog.categories');
  const currentLang = locale.value;
  if (currentLang === 'en' && category.nameEN) {
    return category.nameEN;
  }
  if (currentLang === 'kk' && category.nameKK) {
    return category.nameKK;
  }
  // По умолчанию русское название
  return category.nameRU || t('catalog.categories');
};

// Функция для получения локализованного generalInfo
const getGeneralInfo = () => {
  if (!product.value) return [];
  const currentLang = locale.value;
  if (currentLang === 'en' && product.value.generalInfoEN?.length > 0) {
    return product.value.generalInfoEN;
  }
  if (currentLang === 'kk' && product.value.generalInfoKK?.length > 0) {
    return product.value.generalInfoKK;
  }
  // По умолчанию русское
  return product.value.generalInfoRU || [];
};

// Функция для получения локализованного description
const getDescription = () => {
  if (!product.value) return '';
  const currentLang = locale.value;
  if (currentLang === 'en' && product.value.descriptionEN) {
    return product.value.descriptionEN;
  }
  if (currentLang === 'kk' && product.value.descriptionKK) {
    return product.value.descriptionKK;
  }
  // По умолчанию русское
  return product.value.descriptionRU || '';
};

// Функция для получения локализованного kit
const getKit = () => {
  if (!product.value) return '';
  const currentLang = locale.value;
  if (currentLang === 'en' && product.value.kitEN) {
    return product.value.kitEN;
  }
  if (currentLang === 'kk' && product.value.kitKK) {
    return product.value.kitKK;
  }
  // По умолчанию русское
  return product.value.kitRU || '';
};

const breadcrumbItems = computed(() => {
  if (!product.value) return [];

  const items = [
    { label: t('breadcrumbs.home'), to: "/" },
    { label: t('breadcrumbs.catalog'), to: "/catalog" },
  ];

  if (productCategory.value) {
    const cat = categories.value.find((c) => c.id === productCategory.value);
    if (cat) {
      items.push({
        label: getCategoryName(cat),
        to: `/catalog?category=${cat.id}`,
      });
    }
  }

  items.push({
    label: product.value.name,
    to: null, // текущая страница, не кликабельная
  });

  return items;
});

async function findProductById(id) {
  // Ищем товар в локальных JSON файлах
  for (const cat of categories.value) {
    try {
      // Имя файла генерируется автоматически: {id}.json
      const fileName = `${cat.id}.json`;
      const data = await $fetch(`/data/${fileName}`);
      const products = Array.isArray(data) ? data : [];
      const found = products.find((p) => p.id === id);
      if (found) {
        productCategory.value = cat.id;
        // Обновляем URL с категорией, если её нет в query
        if (!route.query.category && cat.id) {
          router.replace({ 
            path: route.path, 
            query: { ...route.query, category: cat.id } 
          });
        }
        return found;
      }
    } catch (e) {
      console.error(`Error loading category ${cat.id}:`, e);
    }
  }
  return null;
}

const openOrderModal = () => {
  isOrderModalOpen.value = true;
};

const closeOrderModal = () => {
  isOrderModalOpen.value = false;
};

const handleOrderSubmit = (orderData) => {
  // Здесь можно добавить отправку данных на сервер
  console.log("Заявка отправлена:", orderData);
  // Можно показать уведомление об успешной отправке
  alert("Заявка успешно отправлена!");
};

const handleImagesUpdated = (newImages) => {
  // Обновляем изображения в продукте
  if (product.value) {
    product.value.images = newImages;
  }
};

onMounted(async () => {
  await loadCategories();
  product.value = await findProductById(productId);
});
</script>

<style scoped>
.catalog-content-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.product-detail-page {
  width: 100%;
}

.product-detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

.product-tabs-section {
  grid-column: 1 / -1;
  margin-top: 48px;
  width: 100%;
}

.product-gallery-section {
  position: static;
}

.product-info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #1f2933;
}

.general-info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.general-info-list li {
  font-size: 1rem;
  line-height: 1.6;
  color: #52606d;
  padding-left: 24px;
  position: relative;
}

.general-info-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #1e88e5;
  font-size: 1.5rem;
  line-height: 1;
  font-weight: 700;
}

.order-button {
  margin-top: 24px;
  padding: 14px 32px;
  background: #1e88e5;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.order-button:hover {
  background: #1565c0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
}

.order-button:active {
  transform: translateY(0);
}

.product-not-found {
  text-align: center;
  padding: 60px 20px;
}

.product-not-found h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #1f2933;
}

.tabs-header {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 24px;
}

.tab-button {
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 0.95rem;
  font-weight: 600;
  color: #52606d;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-bottom: -2px;
  position: relative;
  flex-shrink: 0;
}

.tab-button::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  transition: background 0.2s ease;
}

.tab-button:hover {
  color: #1e88e5;
  background: rgba(30, 136, 229, 0.05);
}

.tab-button.active {
  color: #1e88e5;
  background: rgba(30, 136, 229, 0.08);
}

.tab-button.active::after {
  background: #1e88e5;
}

.tabs-content {
  min-height: 200px;
  width: 100%;
}

.tabs-content > * {
  display: block;
  width: 100%;
}

@media (max-width: 991.98px) {
  .product-detail-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .product-gallery-section {
    position: static;
  }

  .product-tabs-section {
    margin-top: 32px;
  }

  .tabs-header {
    gap: 2px;
  }

  .tab-button {
    padding: 10px 14px;
    font-size: 0.85rem;
    flex: 1 1 auto;
    min-width: 0;
  }
}
</style>
