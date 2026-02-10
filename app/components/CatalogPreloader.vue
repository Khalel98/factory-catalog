<template>
  <div class="catalog-preloader" :class="[`catalog-preloader--${type}`]">
    <!-- Сетка товаров: скелетоны карточек -->
    <template v-if="type === 'grid'">
      <div class="preloader-grid">
        <div v-for="n in 6" :key="n" class="preloader-card">
          <div class="preloader-card-image skeleton" />
          <div class="preloader-card-line skeleton" style="width: 90%; height: 18px;" />
          <div class="preloader-card-line skeleton" style="width: 70%; height: 14px;" />
          <div class="preloader-card-line skeleton" style="width: 50%; height: 14px;" />
          <div class="preloader-card-footer">
            <div class="preloader-card-line skeleton" style="width: 80px; height: 16px;" />
            <div class="preloader-card-btn skeleton" />
          </div>
        </div>
      </div>
    </template>

    <!-- Карточка товара: скелетон галереи + инфо -->
    <template v-else-if="type === 'detail'">
      <div class="preloader-detail">
        <div class="preloader-detail-gallery">
          <div class="skeleton preloader-detail-image" />
        </div>
        <div class="preloader-detail-info">
          <div class="skeleton preloader-detail-title" />
          <div class="skeleton preloader-detail-line" style="width: 100%;" />
          <div class="skeleton preloader-detail-line" style="width: 85%;" />
          <div class="skeleton preloader-detail-line" style="width: 70%;" />
          <div class="skeleton preloader-detail-btn" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'grid',
    validator: (v) => ['grid', 'detail'].includes(v),
  },
});
</script>

<style scoped>
.catalog-preloader {
  width: 100%;
  min-height: 200px;
}

.skeleton {
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Grid */
.preloader-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.preloader-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 28px rgba(17, 24, 39, 0.08);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.preloader-card-image {
  width: 100%;
  height: 150px;
  margin-bottom: 12px;
}

.preloader-card-line {
  margin-bottom: 8px;
}

.preloader-card-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preloader-card-btn {
  width: 100%;
  height: 40px;
  border-radius: 8px;
}

@media (max-width: 991.98px) {
  .preloader-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767.98px) {
  .preloader-grid {
    grid-template-columns: 1fr;
  }
}

/* Detail */
.preloader-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

.preloader-detail-image {
  width: 100%;
  aspect-ratio: 1;
  max-height: 400px;
  border-radius: 12px;
}

.preloader-detail-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preloader-detail-title {
  height: 28px;
  width: 70%;
}

.preloader-detail-line {
  height: 16px;
}

.preloader-detail-btn {
  margin-top: 16px;
  height: 48px;
  width: 100%;
  border-radius: 8px;
}

@media (max-width: 991.98px) {
  .preloader-detail {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
