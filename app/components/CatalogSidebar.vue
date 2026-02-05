<template>
  <aside class="catalog-sidebar">
    <h3>{{ t('catalog.categories') }}</h3>
    <ul class="category-list">
      <li
        v-for="category in mainCategories"
        :key="category.id"
        :class="{ 
          active: selectedCategoryId === category.id,
          expanded: isExpanded(category.id),
          hasSubcategories: getSubcategories(category.id).length > 0
        }"
      >
        <div 
          class="category-item" 
          @click="handleCategoryClick(category)"
        >
          <span class="category-name">{{ getCategoryName(category) }}</span>
          <span 
            v-if="getSubcategories(category.id).length > 0" 
            class="expand-icon"
            :class="{ expanded: isExpanded(category.id) }"
          >
            ▼
          </span>
        </div>
        <!-- Подкатегории -->
        <ul 
          v-if="getSubcategories(category.id).length > 0 && isExpanded(category.id)" 
          class="subcategory-list"
        >
          <li
            v-for="subcategory in getSubcategories(category.id)"
            :key="subcategory.id"
            :class="{ active: selectedCategoryId === subcategory.id }"
            @click.stop="selectCategory(subcategory.id)"
          >
            {{ getCategoryName(subcategory) }}
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script setup>
const { t, locale } = useI18n();
const emit = defineEmits(["select"]);
const router = useRouter();
const route = useRoute();

const categories = ref([]);
const selectedCategoryId = ref(null);
const expandedCategories = ref(new Set());

// Функция для получения локализованного названия категории
const getCategoryName = (category) => {
  const currentLang = locale.value;
  if (currentLang === 'kk' && category.nameKK) {
    return category.nameKK;
  }
  // По умолчанию русское название
  return category.nameRU || '';
};

// Получаем только основные категории (без parentId)
const mainCategories = computed(() => {
  return categories.value.filter(cat => !cat.parentId);
});

// Получаем подкатегории для указанной категории
const getSubcategories = (parentId) => {
  return categories.value.filter(cat => cat.parentId === parentId);
};

// Проверяем, раскрыта ли категория
const isExpanded = (categoryId) => {
  return expandedCategories.value.has(categoryId);
};

// Обработка клика по категории
const handleCategoryClick = (category) => {
  const hasSubcategories = getSubcategories(category.id).length > 0;
  
  if (hasSubcategories) {
    // Если есть подкатегории - переключаем раскрытие
    if (isExpanded(category.id)) {
      // Если раскрыта - сворачиваем
      expandedCategories.value.delete(category.id);
      // Если была выбрана эта категория или её подкатегория, снимаем выбор
      const subcategoryIds = getSubcategories(category.id).map(sub => sub.id);
      if (selectedCategoryId.value === category.id || subcategoryIds.includes(selectedCategoryId.value)) {
        selectedCategoryId.value = null;
        emit("select", null);
        router.push({ path: "/catalog", query: {} });
      }
    } else {
      // Если свернута - раскрываем и выбираем категорию
      expandedCategories.value.add(category.id);
      selectCategory(category.id);
    }
  } else {
    // Если нет подкатегорий - просто выбираем категорию
    selectCategory(category.id);
  }
};

const loadCategories = async () => {
  try {
    const data = await $fetch("/data/categories.json");
    categories.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error loading categories:", error);
    categories.value = [];
  }
};

onMounted(async () => {
  await loadCategories();
  // Проверяем query параметр category
  if (route.query.category) {
    const categoryId = route.query.category;
    selectedCategoryId.value = categoryId;
    
    const category = categories.value.find(cat => cat.id === categoryId);
    if (category) {
      // Если выбрана подкатегория, раскрываем родительскую категорию
      if (category.parentId) {
        expandedCategories.value.add(category.parentId);
      }
      // Если выбрана основная категория с подкатегориями, раскрываем её
      else if (getSubcategories(category.id).length > 0) {
        expandedCategories.value.add(category.id);
      }
    }
  } else if (categories.value.length > 0) {
    const firstCategory = categories.value[0];
    selectedCategoryId.value = firstCategory.id;
    // Если у первой категории есть подкатегории, раскрываем её
    if (getSubcategories(firstCategory.id).length > 0) {
      expandedCategories.value.add(firstCategory.id);
    }
  }
});

// Отслеживаем изменения route для обновления активной категории
watch(
  () => route.query.category,
  (newCategory) => {
    if (newCategory) {
      selectedCategoryId.value = newCategory;
      
      const category = categories.value.find(cat => cat.id === newCategory);
      if (category) {
        // Если выбрана подкатегория, раскрываем родительскую категорию
        if (category.parentId) {
          expandedCategories.value.add(category.parentId);
        }
        // Если выбрана основная категория с подкатегориями, раскрываем её
        else if (getSubcategories(category.id).length > 0) {
          expandedCategories.value.add(category.id);
        }
      }
    } else {
      selectedCategoryId.value = null;
    }
  },
  { immediate: true }
);

function selectCategory(id) {
  selectedCategoryId.value = id;
  emit("select", id);
  router.push({ path: "/catalog", query: { category: id } });
}
</script>

<style scoped>
.catalog-sidebar {
  min-width: 220px;
  background: #f7f7fa;
  border-radius: 10px;
  padding: 16px 12px;
  margin-right: 32px;
}
.catalog-sidebar h3 {
  font-size: 1rem;
  margin: 0 0 12px 0;
  padding: 0;
}
.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.category-list > li {
  margin-bottom: 2px;
}
.category-item {
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}
.category-name {
  flex: 1;
}
.expand-icon {
  font-size: 0.6rem;
  color: #52606d;
  transition: transform 0.2s ease;
  margin-left: 6px;
}
.expand-icon.expanded {
  transform: rotate(180deg);
}
.category-item:hover,
.category-list > li.active > .category-item {
  background: #e0e7ff;
}

.subcategory-list {
  list-style: none;
  padding: 0;
  margin: 2px 0 0 12px;
  animation: slideDown 0.2s ease;
  display: grid;
  gap: 5px;
}
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}
.subcategory-list li {
  padding: 4px 6px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
  font-size: 0.85rem;
  color: #52606d;
}
.subcategory-list li:hover,
.subcategory-list li.active {
  background: #d1d5db;
}
</style>
