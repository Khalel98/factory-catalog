<template>
  <div class="tab-panel">
    <!-- Кнопка управления категориями — в самом верху (только для админа) -->
    <div v-if="isAdmin" class="top-admin-bar">
      <button type="button" class="btn-open-modal" @click="isCategoriesModalOpen = true">
        Управление категориями
      </button>
    </div>

    <!-- Редактор HTML (цены и комплектация) -->
    <HtmlContentEditor
      :content="getPriceComplectation()"
      :content-r-u="contentRU"
      :content-k-k="contentKK"
      :product-id="productId"
      :category-id="categoryId"
      api-endpoint="/api/update-product-price-complectation"
      translation-key="priceComplectation"
      api-field-name="priceComplectation"
      placeholder="Введите информацию о ценах и комплектации..."
      empty-message="Информация о ценах и комплектации будет добавлена позже"
    />

    <!-- Блок категорий с товарами -->
    <div class="categories-section">
      <!-- Режим админа -->
      <div v-if="isAdmin" class="admin-mode">
        <div v-if="categoriesWithProducts.length > 0" class="admin-header">
          <h3>Категории товаров (цены и комплектация)</h3>
        </div>

        <!-- Модалка: добавление и редактирование категорий -->
        <Teleport to="body">
          <div v-if="isCategoriesModalOpen" class="modal-overlay" @click.self="isCategoriesModalOpen = false">
            <div class="modal-box">
              <div class="modal-header">
                <h3>Добавление категорий</h3>
                <button type="button" class="modal-close" @click="isCategoriesModalOpen = false">×</button>
              </div>
              <div class="modal-body">
                <!-- Форма добавления — наверху -->
                <div class="admin-controls">
                  <div class="input-group">
                    <label for="category-name-input">Название категории:</label>
                    <input
                      id="category-name-input"
                      v-model="newCategoryName"
                      type="text"
                      placeholder="Например: Дополнительное оборудование"
                      class="text-input"
                    />
                  </div>
                  <div class="input-group">
                    <label for="category-ids-input">ID товаров (через запятую):</label>
                    <input
                      id="category-ids-input"
                      v-model="newCategoryIdsInput"
                      type="text"
                      placeholder="Например: 123, 456, 789"
                      class="text-input"
                    />
                  </div>
                  <div class="button-group">
                    <button type="button" @click="addCategory" class="btn-add">Добавить в список</button>
                  </div>
                </div>

                <div v-if="localCategories.length > 0" class="current-categories">
                  <h4>Текущие категории:</h4>
                  <div class="category-cards">
                    <div
                      v-for="(cat, catIndex) in localCategories"
                      :key="catIndex"
                      class="category-card admin"
                    >
                      <div class="category-card-header">
                        <strong>{{ cat.name || "Без названия" }}</strong>
                        <button type="button" @click="removeCategory(catIndex)" class="remove-btn">×</button>
                      </div>
                      <div class="category-ids">
                        <span v-for="(id, idIdx) in cat.productIds" :key="idIdx" class="id-tag">{{ id }}</span>
                        <span v-if="!cat.productIds.length" class="no-ids">Нет товаров</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-cancel" @click="isCategoriesModalOpen = false">Закрыть</button>
                <button type="button" class="btn-save" @click="saveCategories" :disabled="isSaving">
                  {{ isSaving ? "Сохранение..." : "Сохранить" }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>

        <div v-if="categoriesWithProducts.length > 0" class="preview-section">
          <h4>Предпросмотр товаров по категориям:</h4>
          <div v-for="(cat, catIndex) in categoriesWithProducts" :key="catIndex" class="preview-category">
            <h5>{{ cat.name }}</h5>
            <div class="products-grid">
              <div
                v-for="product in cat.products"
                :key="product.id"
                class="product-card"
                @click="goToProduct(product)"
              >
                <div class="product-image-wrapper" v-if="product.images?.length">
                  <img :src="product.images[0]" :alt="product.name" class="product-image" />
                </div>
                <div class="product-info">
                  <h5 class="product-name">{{ product.name }}</h5>
                  <ul class="product-general-info" v-if="getProductGeneralInfo(product).length > 0">
                    <li v-for="(info, idx) in getProductGeneralInfo(product).slice(0, 3)" :key="idx">{{ info }}</li>
                  </ul>
                  <div class="product-price" v-if="product.price">
                    {{ t('catalog.priceFrom', { price: product.price }) }}
                  </div>
                  <button type="button" class="btn-more">{{ t('catalog.more') }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Режим пользователя: аккордеон с товарами -->
      <div v-else class="user-mode">
        <div v-if="loading" class="loading-state">
          <p>Загрузка...</p>
        </div>
        <div v-else class="accordion">
          <div
            v-for="(cat, catIndex) in categoriesWithProducts"
            :key="catIndex"
            class="accordion-item"
          >
            <button
              type="button"
              class="accordion-header"
              :class="{ open: openedAccordionIndex === catIndex }"
              @click="toggleAccordion(catIndex)"
            >
              <span>{{ cat.name }}</span>
              <span class="accordion-icon">{{ openedAccordionIndex === catIndex ? "−" : "+" }}</span>
            </button>
            <div v-show="openedAccordionIndex === catIndex" class="accordion-content">
              <div class="products-grid">
                <div
                  v-for="product in cat.products"
                  :key="product.id"
                  class="product-card"
                  @click="goToProduct(product)"
                >
                  <div class="product-image-wrapper" v-if="product.images?.length">
                    <img :src="product.images[0]" :alt="product.name" class="product-image" />
                  </div>
                  <div class="product-info">
                    <h5 class="product-name">{{ product.name }}</h5>
                    <ul class="product-general-info" v-if="getProductGeneralInfo(product).length > 0">
                      <li v-for="(info, idx) in getProductGeneralInfo(product).slice(0, 3)" :key="idx">{{ info }}</li>
                    </ul>
                    <div class="product-price" v-if="product.price">
                      {{ t('catalog.priceFrom', { price: product.price }) }}
                    </div>
                    <button type="button" class="btn-more">{{ t('catalog.more') }}</button>
                  </div>
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
import { ref, computed, onMounted, watch } from "vue";
import HtmlContentEditor from "@/components/HtmlContentEditor.vue";
import { useI18n } from "@/composables/useI18n";

const props = defineProps({
  content: { type: String, default: "" },
  contentRU: { type: String, default: "" },
  contentKK: { type: String, default: "" },
  productId: { type: String, default: "" },
  categoryId: { type: String, default: "" },
  priceComplectationCategories: {
    type: Array,
    default: () => [],
  },
});

const { t, locale } = useI18n();

const isAdmin = computed(() => {
  if (process.client) {
    return localStorage.getItem("isAdmin") === "true";
  }
  return false;
});

const getPriceComplectation = () => {
  const currentLang = locale.value;
  if (currentLang === "kk" && props.contentKK) return props.contentKK;
  return props.contentRU || props.content || "";
};

const localCategories = ref([]);
const newCategoryName = ref("");
const newCategoryIdsInput = ref("");
const isSaving = ref(false);
const loading = ref(false);
const openedAccordionIndex = ref(null);
const isCategoriesModalOpen = ref(false);

const categoriesWithProducts = ref([]);

function parseCategories(cats) {
  if (!Array.isArray(cats)) return [];
  return cats.map((c) => ({
    name: String(c?.name ?? "").trim(),
    productIds: Array.isArray(c?.productIds)
      ? c.productIds.map((id) => String(id).trim()).filter(Boolean)
      : [],
  })).filter((c) => c.name || (c.productIds && c.productIds.length > 0));
}

function syncLocalFromProps() {
  localCategories.value = parseCategories(props.priceComplectationCategories);
}

function addCategory() {
  const name = newCategoryName.value.trim();
  if (!name) return;
  const idsStr = newCategoryIdsInput.value.trim();
  const productIds = idsStr
    ? idsStr.split(/[,\s]+/).map((id) => id.trim()).filter(Boolean)
    : [];
  localCategories.value.push({ name, productIds });
  newCategoryName.value = "";
  newCategoryIdsInput.value = "";
  loadCategoriesWithProducts();
}

function removeCategory(index) {
  localCategories.value.splice(index, 1);
  loadCategoriesWithProducts();
}

function toggleAccordion(index) {
  openedAccordionIndex.value = openedAccordionIndex.value === index ? null : index;
}

async function loadCategoriesWithProducts() {
  const source = isAdmin.value ? localCategories.value : parseCategories(props.priceComplectationCategories);
  if (source.length === 0) {
    categoriesWithProducts.value = [];
    return;
  }

  loading.value = true;
  const result = [];

  try {
    const categories = await $fetch("/data/categories.json");
    for (const cat of source) {
      const products = [];
      for (const category of categories) {
        try {
          const categoryData = await $fetch(`/data/${category.id}.json`);
          const productsList = Array.isArray(categoryData) ? categoryData : [];
          for (const productId of cat.productIds || []) {
            const product = productsList.find((p) => String(p.id) === String(productId));
            if (product && !products.find((p) => String(p.id) === String(product.id))) {
              products.push(product);
            }
          }
        } catch (e) {
          continue;
        }
      }
      result.push({ name: cat.name, productIds: cat.productIds || [], products });
    }
    categoriesWithProducts.value = result;
  } catch (error) {
    console.error("Error loading products for categories:", error);
  } finally {
    loading.value = false;
  }
}

async function saveCategories() {
  if (!props.productId || !props.categoryId) {
    alert("Ошибка: отсутствуют productId или categoryId");
    return;
  }
  isSaving.value = true;
  try {
    const response = await $fetch("/api/update-price-complectation-categories", {
      method: "POST",
      body: {
        productId: props.productId,
        categoryId: props.categoryId,
        priceComplectationCategories: localCategories.value,
      },
    });
    if (response.success) {
      isCategoriesModalOpen.value = false;
      alert("✅ Категории сохранены!");
      window.location.reload();
    }
  } catch (error) {
    console.error("Error saving categories:", error);
    alert(`❌ Ошибка: ${error.data?.message || error.message || "Неизвестная ошибка"}`);
  } finally {
    isSaving.value = false;
  }
}

async function goToProduct(product) {
  try {
    const categories = await $fetch("/data/categories.json");
    for (const category of categories) {
      try {
        const categoryData = await $fetch(`/data/${category.id}.json`);
        const products = Array.isArray(categoryData) ? categoryData : [];
        const found = products.find((p) => String(p.id) === String(product.id));
        if (found) {
          const cat = categories.find((c) => c.id === category.id);
          if (cat?.parentId) {
            await navigateTo(`/catalog/${cat.parentId}/${category.id}/${product.id}`);
          } else {
            await navigateTo(`/catalog/${category.id}/${product.id}`);
          }
          return;
        }
      } catch (e) {
        continue;
      }
    }
    if (props.categoryId) {
      await navigateTo(`/catalog/${props.categoryId}/${product.id}`);
    }
  } catch (error) {
    if (props.categoryId) {
      await navigateTo(`/catalog/${props.categoryId}/${product.id}`);
    }
  }
}

function getProductGeneralInfo(item) {
  if (!item) return [];
  const currentLang = locale.value;
  if (currentLang === "kk" && item.generalInfoKK?.length > 0) return item.generalInfoKK;
  return item.generalInfoRU || [];
}

watch(
  () => props.priceComplectationCategories,
  () => {
    syncLocalFromProps();
    if (!isAdmin.value) loadCategoriesWithProducts();
  },
  { deep: true }
);

onMounted(() => {
  syncLocalFromProps();
  loadCategoriesWithProducts();
});
</script>

<style scoped>
.tab-panel {
  font-size: 1rem;
  line-height: 1.8;
  color: #52606d;
}

.top-admin-bar {
  margin-bottom: 20px;
}

.categories-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

/* Admin */
.admin-mode {
  padding: 16px 0;
}

.admin-header {
  margin-bottom: 20px;
}

.admin-header h3 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1f2933;
  margin: 0 0 12px 0;
}

.btn-open-modal {
  padding: 10px 18px;
  background: #16396C;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-open-modal:hover {
  background: #1565c0;
}

/* Модалка */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 16px 16px;
  z-index: 1000;
  overflow-y: auto;
}

.modal-box {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2933;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.modal-close:hover {
  color: #1f2933;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 0 0 12px 12px;
}

.btn-cancel {
  padding: 10px 18px;
  background: #fff;
  color: #52606d;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f1f5f9;
}

.admin-controls {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 14px;
}

.input-group label {
  display: block;
  font-weight: 600;
  color: #1f2933;
  margin-bottom: 6px;
}

.text-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
}

.text-input:focus {
  outline: none;
  border-color: #16396C;
  box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.15);
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.btn-add,
.btn-save {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add {
  background: #4caf50;
  color: white;
}

.btn-add:hover {
  background: #45a049;
}

.btn-save {
  background: #16396C;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #1565c0;
}

.btn-save:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
  opacity: 0.7;
}

.current-categories {
  margin-top: 20px;
}

.current-categories h4,
.preview-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2933;
  margin: 0 0 12px 0;
}

.category-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.category-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  min-width: 200px;
}

.category-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.remove-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.remove-btn:hover {
  color: #dc2626;
}

.category-ids {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.id-tag {
  display: inline-block;
  padding: 4px 8px;
  background: #e3f2fd;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #1565c0;
}

.no-ids {
  font-size: 0.9rem;
  color: #94a3b8;
}

.preview-section {
  margin-top: 20px;
}

.preview-category {
  margin-bottom: 20px;
}

.preview-category h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  margin: 0 0 10px 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.product-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.product-image-wrapper {
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 6px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2933;
  margin: 0;
}

.product-id {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.product-general-info {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-general-info li {
  font-size: 0.85rem;
  color: #52606d;
  padding-left: 14px;
  position: relative;
}

.product-general-info li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #16396C;
}

.product-price {
  font-size: 0.95rem;
  font-weight: 600;
  color: #16396C;
  margin-top: 4px;
}

.btn-more {
  margin-top: 6px;
  padding: 8px 14px;
  background: #16396C;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn-more:hover {
  background: #1565c0;
}

/* User: accordion */
.user-mode {
  padding: 12px 0;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: #9ca3af;
}

.empty-message {
  font-style: italic;
  font-size: 1rem;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1f2933;
  margin: 0 0 16px 0;
}

.accordion {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.accordion-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.accordion-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #f8fafc;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2933;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.accordion-header:hover {
  background: #f1f5f9;
}

.accordion-header.open {
  background: #e0f2fe;
  color: #0369a1;
}

.accordion-icon {
  font-size: 1.2rem;
  color: #64748b;
}

.accordion-content {
  padding: 16px 18px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 900px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  .button-group {
    flex-direction: column;
  }
  .btn-add,
  .btn-save {
    width: 100%;
  }
}
</style>
