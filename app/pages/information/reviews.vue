<template>
  <div class="spacing">
    <section class="section">
      <div class="card">
        <h1>{{ t('information.reviewsTitle') }}</h1>
        <p class="muted">
          {{ t('information.reviewsSubtitle') }}
        </p>
      </div>
    </section>

    <section class="section">
      <div class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="card review-card">
          <div class="review-header">
            <div class="review-author">
              <div class="author-avatar">
                {{ review.author.charAt(0).toUpperCase() }}
              </div>
              <div class="author-info">
                <strong>{{ review.author }}</strong>
                <span class="muted">{{ review.company }}</span>
              </div>
            </div>
            <div class="review-rating">
              <div class="stars">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  class="star"
                  :class="{ 'filled': i <= review.rating }"
                >
                  ★
                </span>
              </div>
              <span class="muted review-date">{{ review.date }}</span>
            </div>
          </div>
          <div class="review-content">
            <p>{{ review.text }}</p>
          </div>
          <div v-if="review.product" class="review-product">
            <span class="muted">{{ t('information.product') }}: </span>
            <strong>{{ review.product }}</strong>
          </div>
        </div>
      </div>
    </section>

    <section v-if="reviews.length === 0" class="section">
      <div class="card">
        <p class="muted" style="text-align: center; padding: 40px 0;">
          {{ t('information.noReviews') }}
        </p>
      </div>
    </section>

    <section class="section">
      <div class="card highlight">
        <h3>{{ t('information.leaveReview') }}</h3>
        <p class="muted">
          {{ t('information.leaveReviewDesc') }}
        </p>
        <NuxtLink to="/contacts" class="btn primary" style="margin-top: 16px">
          {{ t('information.contactUs') }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const reviews = ref([
  // Здесь можно добавить реальные отзывы
  // {
  //   id: 1,
  //   author: 'Иван Петров',
  //   company: 'ООО "Газпром"',
  //   rating: 5,
  //   date: '2024-01-15',
  //   text: 'Отличное оборудование, работает без нареканий уже более года. Сервисная поддержка на высшем уровне.',
  //   product: 'Газоанализатор ФП23'
  // }
]);
</script>

<style lang="scss" scoped>
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(17, 24, 39, 0.12);
  }
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.review-author {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e88e5, #1565c0);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: #1f2933;
    font-size: 16px;
  }
}

.review-rating {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.stars {
  display: flex;
  gap: 2px;
  font-size: 18px;
}

.star {
  color: #e5e7eb;
  
  &.filled {
    color: #f6ad55;
  }
}

.review-date {
  font-size: 13px;
}

.review-content {
  margin-bottom: 12px;
  line-height: 1.6;
  color: #1f2933;
}

.review-product {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  font-size: 14px;
}

@media (max-width: 767.98px) {
  .review-header {
    flex-direction: column;
  }

  .review-rating {
    align-items: flex-start;
    width: 100%;
  }
}
</style>
