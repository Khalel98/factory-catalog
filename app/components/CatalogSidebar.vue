<template>
  <aside class="catalog-sidebar">
    <h3>{{ t('catalog.categories') }}</h3>
    <ul class="category-list">
      <li
        v-for="category in categories"
        :key="category.id"
        :class="{ active: selectedCategoryId === category.id }"
        @click="selectCategory(category.id)"
      >
        {{ getCategoryName(category) }}
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

// Функция для получения локализованного названия категории
const getCategoryName = (category) => {
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
    selectedCategoryId.value = route.query.category;
  } else if (categories.value.length > 0) {
    selectedCategoryId.value = categories.value[0].id;
  }
});

// Отслеживаем изменения route для обновления активной категории
watch(
  () => route.query.category,
  (newCategory) => {
    if (newCategory) {
      selectedCategoryId.value = newCategory;
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
  padding: 24px 16px;
  margin-right: 32px;
}
.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.category-list li {
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}
.category-list li.active,
.category-list li:hover {
  background: #e0e7ff;
  font-weight: 600;
}
</style>
