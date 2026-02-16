<template>
  <div class="language-switcher">
    <select
      v-model="currentLocale"
      class="language-select"
      :aria-label="'Select language'"
    >
      <option value="ru">RU</option>
      <option value="kk">KZ</option>
    </select>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

const { locale, setLocale } = useI18n();

const currentLocale = computed({
  get: () => locale.value,
  set: (value) => {
    setLocale(value);
  }
});

// Дополнительная синхронизация с localStorage при монтировании компонента
onMounted(() => {
  try {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && (savedLocale === 'ru' || savedLocale === 'kk')) {
      if (savedLocale !== locale.value) {
        setLocale(savedLocale);
      }
    }
  } catch (e) {
    console.warn('Failed to read locale from localStorage:', e);
  }
});
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
}

.language-select {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #52606d;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2352606d' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
  padding-right: 32px;
  min-width: 60px;
}

.language-select:hover {
  background-color: #f5f5f5;
  border-color: #16396C;
}

.language-select:focus {
  outline: none;
  border-color: #16396C;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}
</style>
