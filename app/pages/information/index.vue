<template>
  <div>
    <section class="section">
      <div class="card">
        <h1>{{ t('information.title') }}</h1>
        <p class="muted">
          {{ t('information.subtitle') }}
        </p>
      </div>
    </section>

    <section class="section split">
      <div class="card">
        <h3>{{ t('information.documentation') }}</h3>
        <ul class="list">
          <li><strong>{{ t('information.userManuals') }}</strong> — {{ t('information.userManualsDesc') }}</li>
          <li><strong>{{ t('information.software') }}</strong> — {{ t('information.softwareDesc') }}</li>
          <li><strong>{{ t('information.catalogs') }}</strong> — {{ t('information.catalogsDesc') }}</li>
        </ul>
      </div>
      <div class="card">
        <h3>{{ t('information.payment') }}</h3>
        <ul class="list">
          <li><strong>{{ t('information.paymentMethod') }}</strong> — {{ t('information.paymentMethodDesc') }}</li>
          <li><strong>{{ t('information.delivery') }}</strong> — {{ t('information.deliveryDesc') }}</li>
          <li><strong>{{ t('information.terms') }}</strong> — {{ t('information.termsDesc') }}</li>
        </ul>
      </div>
      <div class="card">
        <h3>{{ t('information.techSupport') }}</h3>
        <ul class="list">
          <li><strong>{{ t('information.hotline') }}</strong> — {{ t('information.hotlineDesc') }}</li>
          <li><strong>{{ t('information.techQuestions') }}</strong> — {{ t('information.techQuestionsDesc') }}</li>
          <li><strong>{{ t('information.training') }}</strong> — {{ t('information.trainingDesc') }}</li>
        </ul>
      </div>
    </section>

    <section class="section">
      <h2>{{ t('information.faq') }}</h2>
      <div class="grid">
        <div v-for="item in faqs" :key="item.q" class="card">
          <h3>{{ item.q }}</h3>
          <p class="muted">{{ item.a }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const faqs = computed(() => [
  { q: t('information.faq1q'), a: t('information.faq1a') },
  { q: t('information.faq2q'), a: t('information.faq2a') },
  { q: t('information.faq3q'), a: t('information.faq3a') },
  { q: t('information.faq4q'), a: t('information.faq4a') }
]);
</script>
