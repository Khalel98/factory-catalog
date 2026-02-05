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
                <div v-if="isAdmin" class="admin-tabs-control">
                  <label class="switch-label">
                    <input
                      type="checkbox"
                      v-model="showAllTabs"
                      class="switch-input"
                    />
                    <span class="switch-slider"></span>
                    <span class="switch-text">Показать все табы</span>
                  </label>
                </div>
                <div class="tabs-header">
                  <button
                    v-for="tab in visibleTabs"
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
                    @videos-updated="handleVideosUpdated"
                  />
                  <KitTab 
                    v-if="activeTab === 'kit'"
                    :kit="getKit()"
                    :kit-r-u="product?.kitRU || ''"
                    :kit-k-k="product?.kitKK || ''"
                    :product-id="product?.id || ''"
                    :category-id="productCategory || ''"
                  />
                  <PriceComplectationTab 
                    v-if="activeTab === 'price-complectation'"
                    :content="getPriceComplectation()"
                    :content-r-u="product?.priceComplectationRU || ''"
                    :content-k-k="product?.priceComplectationKK || ''"
                    :product-id="product?.id || ''"
                    :category-id="productCategory || ''"
                  />
                  <SpecificationsTab 
                    v-if="activeTab === 'specifications'"
                    :content="getSpecifications()"
                    :specifications-r-u="product?.specificationsRU || ''"
                    :specifications-k-k="product?.specificationsKK || ''"
                    :product-id="product?.id || ''"
                    :category-id="productCategory || ''"
                  />
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
const showAllTabs = ref(false);
const documentationData = ref(null);
const videosData = ref(null);

// Инициализация showAllTabs из localStorage
if (process.client) {
  const savedShowAllTabs = localStorage.getItem('showAllTabs');
  if (savedShowAllTabs !== null) {
    showAllTabs.value = savedShowAllTabs === 'true';
  }
}

// Сохранение состояния свитча в localStorage
watch(showAllTabs, (newValue) => {
  if (process.client) {
    localStorage.setItem('showAllTabs', newValue.toString());
  }
});

const { t, locale } = useI18n();

// Проверка, является ли пользователь админом
const isAdmin = computed(() => {
  if (process.client) {
    return localStorage.getItem('isAdmin') === 'true';
  }
  return false;
});

const tabs = computed(() => [
  { id: "documentation", label: t('tabs.documentation') },
  { id: "price-complectation", label: t('tabs.priceComplectation') },
  { id: "description", label: t('tabs.description') },
  { id: "specifications", label: t('tabs.specifications') },
  { id: "kit", label: t('tabs.kit') },
  { id: "video", label: t('tabs.video') },
  { id: "compatibility", label: t('tabs.compatibility') },
]);

// Функция для проверки, заполнен ли таб
const isTabFilled = (tabId) => {
  if (!product.value) return false;

  switch (tabId) {
    case 'description':
      const desc = getDescription();
      return desc && desc.trim() !== '';
    
    case 'kit':
      const kit = getKit();
      return kit && kit.trim() !== '';
    
    case 'price-complectation':
      const priceComp = getPriceComplectation();
      return priceComp && priceComp.trim() !== '';
    
    case 'specifications':
      const specs = getSpecifications();
      return specs && specs.trim() !== '';
    
    case 'documentation':
      if (documentationData.value) {
        return documentationData.value.blocks && 
               Array.isArray(documentationData.value.blocks) && 
               documentationData.value.blocks.length > 0;
      }
      return false;
    
    case 'video':
      if (videosData.value) {
        return videosData.value.videos && 
               Array.isArray(videosData.value.videos) && 
               videosData.value.videos.length > 0;
      }
      return false;
    
    case 'compatibility':
      return false; // Всегда пустой
    
    default:
      return false;
  }
};

// Фильтрация табов в зависимости от прав и настроек
const visibleTabs = computed(() => {
  if (isAdmin.value && showAllTabs.value) {
    // Админ с включенным свитчем - показываем все табы
    return tabs.value;
  }
  
  // Для не-админа или админа с выключенным свитчем - показываем только заполненные
  return tabs.value.filter(tab => isTabFilled(tab.id));
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

// Функция для получения локализованного названия категории
const getCategoryName = (category) => {
  if (!category) return t('catalog.categories');
  const currentLang = locale.value;
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
  if (currentLang === 'kk' && product.value.kitKK) {
    return product.value.kitKK;
  }
  // По умолчанию русское
  return product.value.kitRU || '';
};

// Функция для получения локализованного priceComplectation
const getPriceComplectation = () => {
  if (!product.value) return '';
  const currentLang = locale.value;
  if (currentLang === 'kk' && product.value.priceComplectationKK) {
    return product.value.priceComplectationKK;
  }
  // По умолчанию русское
  return product.value.priceComplectationRU || product.value.priceComplectationInfo || '';
};

// Функция для получения локализованных specifications
const getSpecifications = () => {
  if (!product.value) return '';
  const currentLang = locale.value;
  if (currentLang === 'kk' && product.value.specificationsKK) {
    return product.value.specificationsKK;
  }
  // По умолчанию русское
  return product.value.specificationsRU || product.value.specificationsInfo || '';
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
      // Если это подкатегория, добавляем родительскую категорию
      if (cat.parentId) {
        const parentCat = categories.value.find((c) => c.id === cat.parentId);
        if (parentCat) {
          items.push({
            label: getCategoryName(parentCat),
            to: `/catalog?category=${parentCat.id}`,
          });
        }
      }
      
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

const handleVideosUpdated = async (newVideos) => {
  // Обновляем видео в продукте и перезагружаем данные
  if (product.value) {
    product.value.videos = newVideos;
  }
  // Перезагружаем видео для обновления данных в родительском компоненте с обходом кеша
  await loadVideos(true);
};

// Загрузка документации для проверки заполненности
const loadDocumentation = async () => {
  try {
    if (!productCategory.value || !productId) return;
    
    const categoryData = await $fetch(`/data/${productCategory.value}.json`);
    const foundProduct = categoryData.find((p) => p.id === productId);
    
    if (foundProduct && foundProduct.documentation) {
      if (typeof foundProduct.documentation === 'string') {
        try {
          documentationData.value = JSON.parse(foundProduct.documentation);
        } catch (e) {
          documentationData.value = null;
        }
      } else {
        documentationData.value = foundProduct.documentation;
      }
    } else {
      documentationData.value = null;
    }
  } catch (error) {
    console.error('Ошибка при загрузке документации:', error);
    documentationData.value = null;
  }
};

// Загрузка видео для проверки заполненности
const loadVideos = async (forceReload = false) => {
  try {
    if (!productCategory.value || !productId) return;
    
    // Загружаем с обходом кеша при необходимости
    const url = `/data/${productCategory.value}.json${forceReload ? '?t=' + Date.now() : ''}`;
    const categoryData = await $fetch(url);
    const foundProduct = categoryData.find((p) => p.id === productId);
    
    if (foundProduct && foundProduct.videos) {
      if (typeof foundProduct.videos === 'string') {
        try {
          videosData.value = JSON.parse(foundProduct.videos);
        } catch (e) {
          videosData.value = null;
        }
      } else {
        videosData.value = foundProduct.videos;
      }
    } else {
      videosData.value = null;
    }
  } catch (error) {
    console.error('Ошибка при загрузке видео:', error);
    videosData.value = null;
  }
};

// Обновление активного таба при изменении видимых табов
watch(visibleTabs, (newTabs) => {
  if (newTabs.length > 0 && !newTabs.find(tab => tab.id === activeTab.value)) {
    // Если текущий активный таб не виден, переключаемся на первый видимый
    activeTab.value = newTabs[0].id;
  }
}, { immediate: true });

// Перезагрузка данных при изменении продукта или категории
watch([() => product.value, () => productCategory.value], async () => {
  if (product.value && productCategory.value) {
    await loadDocumentation();
    await loadVideos();
  }
});

onMounted(async () => {
  await loadCategories();
  product.value = await findProductById(productId);
  await loadDocumentation();
  await loadVideos();
});
</script>

<style scoped>
.catalog-content-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0; /* сжатие в grid на узких экранах */
}

.product-detail-page {
  width: 100%;
}

.product-detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
  min-width: 0; /* не даёт гриду растягивать страницу на узких экранах */
}

.product-tabs-section {
  grid-column: 1 / -1;
  margin-top: 48px;
  width: 100%;
  min-width: 0; /* не даёт широким таблицам в табах растягивать страницу */
  overflow-x: hidden;
}

.product-gallery-section {
  position: static;
  min-width: 0; /* позволяет сжиматься в grid на узких экранах */
  overflow: hidden;
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

.admin-tabs-control {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.switch-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background: #cbd5e1;
  border-radius: 24px;
  transition: background 0.3s ease;
}

.switch-slider::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  top: 3px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch-input:checked + .switch-slider {
  background: #1e88e5;
}

.switch-input:checked + .switch-slider::before {
  transform: translateX(20px);
}

.switch-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: #52606d;
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
  min-width: 0;
  overflow-x: hidden;
}

.tabs-content > * {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
}

@media (max-width: 991.98px) {
  .product-detail-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .product-gallery-section {
    position: static;
    min-width: 0;
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
