<template>
  <div class="tab-panel">
    <!-- Режим админа: управление совместимым оборудованием -->
    <div v-if="isAdmin" class="admin-mode">
      <div class="admin-header">
        <h3>Управление совместимым оборудованием</h3>
        <p class="admin-hint">Добавьте ID товаров, которые совместимы с этим товаром. ID можно вводить через запятую или по одному.</p>
      </div>

      <div class="admin-controls">
        <div class="input-group">
          <label for="product-id-input">ID товаров (через запятую):</label>
          <input
            id="product-id-input"
            v-model="productIdsInput"
            type="text"
            placeholder="Например: 123, 456, 789"
            class="product-id-input"
          />
        </div>
        <div class="button-group">
          <button @click="addProductId" class="btn-add">Добавить ID</button>
          <button @click="saveCompatibility" class="btn-save" :disabled="isSaving">
            {{ isSaving ? "Сохранение..." : "Сохранить" }}
          </button>
        </div>
      </div>

      <div v-if="compatibleProductIds.length > 0" class="current-compatibility">
        <h4>Текущие совместимые товары (ID):</h4>
        <div class="id-list">
          <span
            v-for="(id, index) in compatibleProductIds"
            :key="index"
            class="id-tag"
          >
            {{ id }}
            <button @click="removeProductId(index)" class="remove-id-btn">×</button>
          </span>
        </div>
      </div>

      <div v-if="compatibleProducts.length > 0" class="preview-section">
        <h4>Предпросмотр совместимых товаров:</h4>
        <div class="products-grid compatibility-grid">
          <div
            v-for="product in compatibleProducts"
            :key="product.id"
            class="product-card"
          >
            <div class="product-image-wrapper" v-if="product.images && product.images.length > 0">
              <img :src="product.images[0]" :alt="product.name" class="product-image" />
            </div>
            <h3>{{ product.name }}</h3>
            <ul class="product-general-info" v-if="getProductGeneralInfo(product).length > 0">
              <li v-for="(info, idx) in getProductGeneralInfo(product).slice(0, 3)" :key="idx">{{ info }}</li>
            </ul>
            <div class="product-info">
              <span class="product-price" v-if="product.price">{{ t('catalog.priceFrom', { price: product.price }) }}</span>
              <span class="product-id">ID: {{ product.id }}</span>
              <button type="button" class="btn primary" style="margin-top: 8px; padding: 8px 12px; font-size: 14px;">{{ t('catalog.more') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Режим пользователя: отображение совместимого оборудования -->
    <div v-else class="user-mode">
      <div v-if="loading" class="loading-state">
        <p>Загрузка совместимого оборудования...</p>
      </div>
      <div v-else-if="compatibleProducts.length === 0" class="empty-state">
        <p class="empty-message">Совместимое оборудование не найдено</p>
      </div>
      <div v-else class="compatible-products">
        <h3 class="section-title">Совместимое оборудование</h3>
        <div class="products-grid compatibility-grid">
          <div
            v-for="product in compatibleProducts"
            :key="product.id"
            class="product-card"
            @click="goToProduct(product)"
          >
            <div class="product-image-wrapper" v-if="product.images && product.images.length > 0">
              <img :src="product.images[0]" :alt="product.name" class="product-image" />
            </div>
            <h3>{{ product.name }}</h3>
            <ul class="product-general-info" v-if="getProductGeneralInfo(product).length > 0">
              <li v-for="(info, idx) in getProductGeneralInfo(product).slice(0, 3)" :key="idx">{{ info }}</li>
            </ul>
            <div class="product-info">
              <span class="product-price" v-if="product.price">{{ t('catalog.priceFrom', { price: product.price }) }}</span>
              <button type="button" class="btn primary" style="margin-top: 8px; padding: 8px 12px; font-size: 14px;">{{ t('catalog.more') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "@/composables/useI18n";

const props = defineProps({
  productId: {
    type: String,
    default: "",
  },
  categoryId: {
    type: String,
    default: "",
  },
});

const { t, locale } = useI18n();

const isAdmin = computed(() => {
  if (process.client) {
    return localStorage.getItem("isAdmin") === "true";
  }
  return false;
});

const compatibleProductIds = ref([]);
const compatibleProducts = ref([]);
const productIdsInput = ref("");
const isSaving = ref(false);
const loading = ref(false);
const currentProduct = ref(null);

// Загружаем текущий товар для получения данных о совместимости
const loadCurrentProduct = async () => {
  if (!props.categoryId || !props.productId) return;
  
  try {
    const data = await $fetch(`/data/${props.categoryId}.json`);
    const found = Array.isArray(data) 
      ? data.find((p) => String(p.id) === String(props.productId))
      : null;
    
    if (found) {
      currentProduct.value = found;
      // Загружаем ID совместимых товаров из текущего товара
      if (found.compatibility && Array.isArray(found.compatibility)) {
        compatibleProductIds.value = [...found.compatibility];
      }
    }
  } catch (error) {
    console.error("Error loading current product:", error);
  }
};

// Загружаем данные о совместимых товарах
const loadCompatibleProducts = async () => {
  if (compatibleProductIds.value.length === 0) {
    compatibleProducts.value = [];
    return;
  }

  loading.value = true;
  compatibleProducts.value = [];

  try {
    // Загружаем все категории
    const categories = await $fetch("/data/categories.json");
    
    // Ищем товары по ID во всех категориях
    for (const category of categories) {
      try {
        const categoryData = await $fetch(`/data/${category.id}.json`);
        const products = Array.isArray(categoryData) ? categoryData : [];
        
        for (const productId of compatibleProductIds.value) {
          const product = products.find(
            (p) => String(p.id) === String(productId)
          );
          if (product && !compatibleProducts.value.find(p => String(p.id) === String(product.id))) {
            compatibleProducts.value.push(product);
          }
        }
      } catch (e) {
        // Пропускаем категории, которые не удалось загрузить
        continue;
      }
    }
  } catch (error) {
    console.error("Error loading compatible products:", error);
  } finally {
    loading.value = false;
  }
};

// Добавление ID товара
const addProductId = () => {
  const input = productIdsInput.value.trim();
  if (!input) return;

  // Разбиваем по запятой и пробелам
  const ids = input
    .split(/[,\s]+/)
    .map((id) => id.trim())
    .filter((id) => id && !compatibleProductIds.value.includes(id));

  compatibleProductIds.value.push(...ids);
  productIdsInput.value = "";
  
  // Автоматически загружаем товары для предпросмотра
  loadCompatibleProducts();
};

// Удаление ID товара
const removeProductId = (index) => {
  compatibleProductIds.value.splice(index, 1);
  loadCompatibleProducts();
};

// Сохранение совместимого оборудования
const saveCompatibility = async () => {
  if (!props.productId || !props.categoryId) {
    alert("Ошибка: отсутствуют productId или categoryId");
    return;
  }

  isSaving.value = true;

  try {
    const response = await $fetch("/api/update-compatibility", {
      method: "POST",
      body: {
        productId: props.productId,
        categoryId: props.categoryId,
        compatibleProductIds: compatibleProductIds.value,
      },
    });

    if (response.success) {
      alert("✅ Совместимое оборудование успешно сохранено!");
      // Перезагружаем страницу для получения актуальных данных
      window.location.reload();
    }
  } catch (error) {
    console.error("Error saving compatibility:", error);
    alert(
      `❌ Ошибка при сохранении: ${error.data?.message || error.message || "Неизвестная ошибка"}`
    );
  } finally {
    isSaving.value = false;
  }
};

// Переход к товару
const goToProduct = async (product) => {
  // Ищем категорию товара во всех категориях
  try {
    const categories = await $fetch("/data/categories.json");
    
    for (const category of categories) {
      try {
        const categoryData = await $fetch(`/data/${category.id}.json`);
        const products = Array.isArray(categoryData) ? categoryData : [];
        const found = products.find((p) => String(p.id) === String(product.id));
        
        if (found) {
          // Нашли товар в категории
          const cat = categories.find((c) => c.id === category.id);
          if (cat?.parentId) {
            await navigateTo(`/catalog/${cat.parentId}/${category.id}/${product.id}`);
          } else {
            await navigateTo(`/catalog/${category.id}/${product.id}`);
          }
          return;
        }
      } catch (e) {
        // Пропускаем категории, которые не удалось загрузить
        continue;
      }
    }
    
    // Если не нашли, используем текущую категорию
    if (props.categoryId) {
      await navigateTo(`/catalog/${props.categoryId}/${product.id}`);
    }
  } catch (error) {
    console.error("Error navigating to product:", error);
    // Fallback на текущую категорию
    if (props.categoryId) {
      await navigateTo(`/catalog/${props.categoryId}/${product.id}`);
    }
  }
};

// Получение общей информации о товаре
const getProductGeneralInfo = (item) => {
  if (!item) return [];
  const currentLang = locale.value;
  if (currentLang === "kk" && item.generalInfoKK?.length > 0) {
    return item.generalInfoKK;
  }
  return item.generalInfoRU || [];
};

// Отслеживание изменений ID для загрузки товаров
watch(
  () => compatibleProductIds.value,
  () => {
    if (!isAdmin.value) {
      loadCompatibleProducts();
    }
  },
  { deep: true }
);

onMounted(async () => {
  await loadCurrentProduct();
  if (isAdmin.value) {
    // Для админа загружаем товары для предпросмотра
    await loadCompatibleProducts();
  } else {
    // Для пользователей загружаем товары сразу
    await loadCompatibleProducts();
  }
});
</script>

<style scoped>
.tab-panel {
  font-size: 1rem;
  line-height: 1.8;
  color: #52606d;
}

/* Админский режим */
.admin-mode {
  padding: 20px 0;
}

.admin-header {
  margin-bottom: 24px;
}

.admin-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2933;
  margin: 0 0 12px 0;
}

.admin-hint {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.admin-controls {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-weight: 600;
  color: #1f2933;
  margin-bottom: 8px;
}

.product-id-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.product-id-input:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.button-group {
  display: flex;
  gap: 12px;
}

.btn-add,
.btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
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
  transform: translateY(-1px);
}

.btn-save {
  background: #1e88e5;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #1565c0;
  transform: translateY(-1px);
}

.btn-save:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
  opacity: 0.7;
}

.current-compatibility {
  margin-bottom: 24px;
}

.current-compatibility h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2933;
  margin: 0 0 12px 0;
}

.id-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.id-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #1565c0;
  font-weight: 600;
}

.remove-id-btn {
  background: none;
  border: none;
  color: #1565c0;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.remove-id-btn:hover {
  background: rgba(21, 101, 192, 0.1);
}

.preview-section {
  margin-top: 24px;
}

.preview-section h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2933;
  margin: 0 0 16px 0;
}

/* Пользовательский режим */
.user-mode {
  padding: 20px 0;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-message {
  font-style: italic;
  font-size: 1.1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2933;
  margin: 0 0 24px 0;
}

/* Сетка как в каталоге, карточки используют глобальные .product-card из main.scss */
.compatibility-grid.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
  align-items: stretch;
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
  color: #1e88e5;
  font-size: 1rem;
  line-height: 1;
  font-weight: 700;
}

.product-info .product-id {
  font-size: 0.85rem;
  color: #64748b;
  display: block;
  margin-bottom: 8px;
}

.compatibility-grid .product-card {
  cursor: pointer;
}

@media (max-width: 991.98px) {
  .compatibility-grid.products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767.98px) {
  .compatibility-grid.products-grid {
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
