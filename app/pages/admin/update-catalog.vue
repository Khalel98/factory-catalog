<template>
  <div class="admin-page spacing">
    <div class="card">
      <h1>{{ t('admin.title') }}</h1>
      <p class="muted">
        {{ t('admin.subtitle') }}
      </p>

      <div class="update-section">
        <button
          @click="updateCatalog"
          :disabled="loading"
          class="btn primary"
          style="width: 100%; margin-top: 24px"
        >
          <span v-if="!loading">🔄 {{ t('admin.update') }}</span>
          <span v-else>⏳ {{ t('admin.updating') }}</span>
        </button>

        <div v-if="result" class="result-box" :class="result.success ? 'success' : 'error'">
          <h3 v-if="result.success">✅ {{ t('admin.success') }}</h3>
          <h3 v-else>❌ {{ t('admin.error') }}</h3>
          <p>{{ result.message }}</p>

          <div v-if="result.success && result.stats" class="stats">
            <div class="stat-item">
              <strong>{{ t('admin.categories') }}</strong> {{ result.stats.categories }}
            </div>
            <div class="stat-item">
              <strong>{{ t('admin.products') }}</strong> {{ result.stats.products }}
            </div>
            <div v-if="result.stats.substances != null" class="stat-item">
              <strong>Вещества</strong> {{ result.stats.substances }}
            </div>
            <div v-if="result.stats.applications != null" class="stat-item">
              <strong>Сферы применения</strong> {{ result.stats.applications }}
            </div>
          </div>

          <div v-if="result.success && result.categories" class="categories-list">
            <h4>{{ t('admin.categoriesList') }}</h4>
            <ul>
              <li
                v-for="cat in result.categories"
                :key="cat.id"
                class="category-item"
              >
                <strong>{{ cat.name }}</strong>
                <span class="products-count">{{ cat.productsCount }} {{ t('admin.productsCount') }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="info-section" style="margin-top: 32px">
        <h3>{{ t('admin.howItWorks') }}</h3>
        <ol class="info-list">
          <li>{{ t('admin.step1') }}</li>
          <li>{{ t('admin.step2') }} <code>public/data/</code></li>
          <li>{{ t('admin.step3') }}</li>
          <li>{{ t('admin.step4') }}</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();
const loading = ref(false);
const result = ref(null);

const updateCatalog = async () => {
  loading.value = true;
  result.value = null;

  try {
    const response = await $fetch("/api/update-catalog", {
      method: "POST",
    });
    result.value = response;
  } catch (error) {
    result.value = {
      success: false,
      message: error.data?.message || error.message || t('admin.error'),
    };
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.admin-page {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #1f2933;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1f2933;
}

h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: #52606d;
}

.muted {
  color: #52606d;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.update-section {
  margin-top: 24px;
}

.btn {
  padding: 14px 32px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.primary {
  background: #16396C;
  color: #ffffff;
}

.btn.primary:hover:not(:disabled) {
  background: #1565c0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-box {
  margin-top: 24px;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid;
}

.result-box.success {
  background: #e8f5e9;
  border-color: #4caf50;
  color: #2e7d32;
}

.result-box.error {
  background: #ffebee;
  border-color: #f44336;
  color: #c62828;
}

.result-box h3 {
  margin: 0 0 8px 0;
  color: inherit;
}

.result-box p {
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.stats {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-item {
  font-size: 1rem;
}

.categories-list {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.categories-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
}

.products-count {
  color: #52606d;
  font-size: 0.9rem;
}

.info-section {
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.info-list {
  margin: 16px 0 0 0;
  padding-left: 24px;
  line-height: 1.8;
  color: #52606d;
}

.info-list li {
  margin-bottom: 8px;
}

code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  font-size: 0.9em;
  color: #16396C;
}

@media (max-width: 768px) {
  .card {
    padding: 24px;
  }

  .stats {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
