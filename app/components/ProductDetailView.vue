<template>
  <div class="product-detail-page">
    <div class="product-detail-layout">
      <div class="product-gallery-section">
        <ProductGallery
          :images="product.images || []"
          :product-name="product.name"
          :product-id="product.id"
          :category-id="categoryId"
          @images-updated="handleImagesUpdated"
        />
      </div>

      <div class="product-info-section">
        <h2 class="section-title">{{ t('product.generalInfo') }}</h2>
        <ul class="general-info-list" v-if="getGeneralInfo().length > 0">
          <li v-for="(item, index) in getGeneralInfo()" :key="index">{{ item }}</li>
        </ul>
        <button class="order-button" @click="openOrderModal">{{ t('product.order') }}</button>
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
            <input type="checkbox" v-model="showAllTabs" class="switch-input" />
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
            :category-id="categoryId || ''"
          />
          <DocumentationTab
            v-if="activeTab === 'documentation'"
            :product-id="product?.id || ''"
            :category-id="categoryId || ''"
          />
          <VideoTab
            v-if="activeTab === 'video'"
            :product-id="product?.id || ''"
            :category-id="categoryId || ''"
            @videos-updated="handleVideosUpdated"
          />
          <KitTab
            v-if="activeTab === 'kit'"
            :kit="getKit()"
            :kit-r-u="product?.kitRU || ''"
            :kit-k-k="product?.kitKK || ''"
            :product-id="product?.id || ''"
            :category-id="categoryId || ''"
          />
          <PriceComplectationTab
            v-if="activeTab === 'price-complectation'"
            :content="getPriceComplectation()"
            :content-r-u="product?.priceComplectationRU || ''"
            :content-k-k="product?.priceComplectationKK || ''"
            :product-id="product?.id || ''"
            :category-id="categoryId || ''"
          />
          <SpecificationsTab
            v-if="activeTab === 'specifications'"
            :content="getSpecifications()"
            :specifications-r-u="product?.specificationsRU || ''"
            :specifications-k-k="product?.specificationsKK || ''"
            :product-id="product?.id || ''"
            :category-id="categoryId || ''"
          />
          <CompatibilityTab
            v-if="activeTab === 'compatibility'"
            :product-id="product?.id || ''"
            :category-id="categoryId || ''"
          />
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

const props = defineProps({
  product: { type: Object, required: true },
  categoryId: { type: String, default: "" },
});

const emit = defineEmits(["images-updated"]);

const { t, locale } = useI18n();
const isOrderModalOpen = ref(false);
const activeTab = ref("documentation");
const showAllTabs = ref(false);
const documentationData = ref(null);
const videosData = ref(null);

if (process.client) {
  const saved = localStorage.getItem("showAllTabs");
  if (saved !== null) showAllTabs.value = saved === "true";
}
watch(showAllTabs, (v) => {
  if (process.client) localStorage.setItem("showAllTabs", String(v));
});

const isAdmin = computed(() => process.client && localStorage.getItem("isAdmin") === "true");

const tabs = computed(() => [
  { id: "documentation", label: t("tabs.documentation") },
  { id: "price-complectation", label: t("tabs.priceComplectation") },
  { id: "description", label: t("tabs.description") },
  { id: "specifications", label: t("tabs.specifications") },
  { id: "kit", label: t("tabs.kit") },
  { id: "video", label: t("tabs.video") },
  { id: "compatibility", label: t("tabs.compatibility") },
]);

const getGeneralInfo = () => {
  if (!props.product) return [];
  return locale.value === "kk" && props.product.generalInfoKK?.length > 0 ? props.product.generalInfoKK : (props.product.generalInfoRU || []);
};
const getDescription = () => {
  if (!props.product) return "";
  return locale.value === "kk" && props.product.descriptionKK ? props.product.descriptionKK : (props.product.descriptionRU || "");
};
const getKit = () => {
  if (!props.product) return "";
  return locale.value === "kk" && props.product.kitKK ? props.product.kitKK : (props.product.kitRU || "");
};
const getPriceComplectation = () => {
  if (!props.product) return "";
  return locale.value === "kk" && props.product.priceComplectationKK ? props.product.priceComplectationKK : (props.product.priceComplectationRU || props.product.priceComplectationInfo || "");
};
const getSpecifications = () => {
  if (!props.product) return "";
  return locale.value === "kk" && props.product.specificationsKK ? props.product.specificationsKK : (props.product.specificationsRU || props.product.specificationsInfo || "");
};

const isTabFilled = (tabId) => {
  if (!props.product) return false;
  switch (tabId) {
    case "description": return !!getDescription().trim();
    case "kit": return !!getKit().trim();
    case "price-complectation": return !!getPriceComplectation().trim();
    case "specifications": return !!getSpecifications().trim();
    case "documentation":
      return !!(documentationData.value?.blocks && Array.isArray(documentationData.value.blocks) && documentationData.value.blocks.length > 0);
    case "video":
      return !!(videosData.value?.videos && Array.isArray(videosData.value.videos) && videosData.value.videos.length > 0);
    case "compatibility":
      // Проверяем наличие совместимых товаров
      // Таб показывается всегда для админа, для пользователей - только если есть совместимые товары
      if (!props.product) return false;
      const compatibility = props.product.compatibility;
      return !!(compatibility && Array.isArray(compatibility) && compatibility.length > 0);
    default: return false;
  }
};

const visibleTabs = computed(() => (isAdmin.value && showAllTabs.value) ? tabs.value : tabs.value.filter((tab) => isTabFilled(tab.id)));

const loadDocumentation = async () => {
  if (!props.categoryId || !props.product?.id) return;
  try {
    const data = await $fetch(`/data/${props.categoryId}.json`);
    const found = Array.isArray(data) ? data.find((p) => String(p.id) === String(props.product.id)) : null;
    if (found?.documentation) {
      documentationData.value = typeof found.documentation === "string" ? (() => { try { return JSON.parse(found.documentation); } catch { return null; } })() : found.documentation;
    } else documentationData.value = null;
  } catch {
    documentationData.value = null;
  }
};

const loadVideos = async (forceReload = false) => {
  if (!props.categoryId || !props.product?.id) return;
  try {
    const url = `/data/${props.categoryId}.json${forceReload ? "?t=" + Date.now() : ""}`;
    const data = await $fetch(url);
    const found = Array.isArray(data) ? data.find((p) => String(p.id) === String(props.product.id)) : null;
    if (found?.videos) {
      videosData.value = typeof found.videos === "string" ? (() => { try { return JSON.parse(found.videos); } catch { return null; } })() : found.videos;
    } else videosData.value = null;
  } catch {
    videosData.value = null;
  }
};

watch(visibleTabs, (newTabs) => {
  if (newTabs.length > 0 && !newTabs.find((tab) => tab.id === activeTab.value)) activeTab.value = newTabs[0].id;
}, { immediate: true });

watch([() => props.product, () => props.categoryId], () => {
  if (props.product && props.categoryId) {
    loadDocumentation();
    loadVideos();
  }
}, { immediate: true });

const openOrderModal = () => { isOrderModalOpen.value = true; };
const closeOrderModal = () => { isOrderModalOpen.value = false; };
const handleOrderSubmit = () => {
  alert("Заявка успешно отправлена!");
};
const handleImagesUpdated = (newImages) => {
  emit("images-updated", newImages);
};
const handleVideosUpdated = async () => {
  await loadVideos(true);
};
</script>

<style scoped>
.product-detail-page { width: 100%; }
.product-detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
  min-width: 0;
}
.product-tabs-section {
  grid-column: 1 / -1;
  margin-top: 48px;
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
}
.product-gallery-section { position: static; min-width: 0; overflow: hidden; }
.product-info-section { display: flex; flex-direction: column; gap: 20px; }
.section-title { font-size: 1.5rem; font-weight: 700; margin: 0; color: #1f2933; }
.general-info-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.general-info-list li { font-size: 1rem; line-height: 1.6; color: #52606d; padding-left: 24px; position: relative; }
.general-info-list li::before { content: "•"; position: absolute; left: 0; color: #1e88e5; font-size: 1.5rem; line-height: 1; font-weight: 700; }
.order-button {
  margin-top: 24px; padding: 14px 32px; background: #1e88e5; color: #fff; border: none; border-radius: 8px;
  font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; width: 100%;
}
.order-button:hover { background: #1565c0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3); }
.order-button:active { transform: translateY(0); }
.admin-tabs-control { margin-bottom: 16px; padding: 12px 16px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; gap: 12px; }
.switch-label { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
.switch-input { position: absolute; opacity: 0; width: 0; height: 0; }
.switch-slider {
  position: relative; display: inline-block; width: 44px; height: 24px; background: #cbd5e1; border-radius: 24px; transition: background 0.3s;
}
.switch-slider::before {
  content: ""; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; background: #fff; border-radius: 50%;
  transition: transform 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.switch-input:checked + .switch-slider { background: #1e88e5; }
.switch-input:checked + .switch-slider::before { transform: translateX(20px); }
.switch-text { font-size: 0.95rem; font-weight: 500; color: #52606d; }
.tabs-header { display: flex; flex-wrap: wrap; gap: 4px; border-bottom: 2px solid #e5e7eb; margin-bottom: 24px; }
.tab-button {
  padding: 12px 20px; background: transparent; border: none; border-bottom: 3px solid transparent;
  font-size: 0.95rem; font-weight: 600; color: #52606d; cursor: pointer; transition: all 0.2s; white-space: nowrap;
  margin-bottom: -2px; position: relative; flex-shrink: 0;
}
.tab-button::after { content: ""; position: absolute; bottom: -2px; left: 0; right: 0; height: 3px; background: transparent; transition: background 0.2s; }
.tab-button:hover { color: #1e88e5; background: rgba(30, 136, 229, 0.05); }
.tab-button.active { color: #1e88e5; background: rgba(30, 136, 229, 0.08); }
.tab-button.active::after { background: #1e88e5; }
.tabs-content { min-height: 200px; width: 100%; min-width: 0; overflow-x: hidden; }
.tabs-content > * { display: block; width: 100%; min-width: 0; max-width: 100%; overflow-x: hidden; }
@media (max-width: 991.98px) {
  .product-detail-layout { grid-template-columns: 1fr; gap: 32px; }
  .product-gallery-section { position: static; min-width: 0; }
  .product-tabs-section { margin-top: 32px; }
  .tabs-header { gap: 2px; }
  .tab-button { padding: 10px 14px; font-size: 0.85rem; flex: 1 1 auto; min-width: 0; }
}
</style>
