<template>
  <div class="spacing">
    <section class="section">
      <div class="card">
        <h1>{{ t('services.title') }}</h1>
        <p class="muted">
          {{ t('services.subtitle') }}
        </p>
        <div class="cta-block">
          <NuxtLink to="/contacts" class="btn primary"
            >{{ t('services.contactSales') }}</NuxtLink
          >
        </div>
      </div>
    </section>

    <section class="section">
      <h2>{{ t('services.whatWeDo') }}</h2>
      <div class="grid">
        <div v-for="item in services" :key="item.title" class="card">
          <h3>{{ item.title }}</h3>
          <p class="muted">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>{{ t('services.process') }}</h2>
      <div class="grid">
        <div v-for="step in steps" :key="step.title" class="card">
          <h3>{{ step.title }}</h3>
          <p class="muted">{{ step.desc }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const services = computed(() => [
  {
    title: t('services.consultation'),
    desc: t('services.consultationDesc'),
  },
  {
    title: t('services.design'),
    desc: t('services.designDesc'),
  },
  {
    title: t('services.installation'),
    desc: t('services.installationDesc'),
  },
  {
    title: t('services.personnel'),
    desc: t('services.personnelDesc'),
  },
  {
    title: t('services.support'),
    desc: t('services.supportDesc'),
  },
  {
    title: t('services.maintenance'),
    desc: t('services.maintenanceDesc'),
  },
]);

const steps = computed(() => [
  {
    title: t('services.request'),
    desc: t('services.requestDesc'),
  },
  {
    title: t('services.solution'),
    desc: t('services.solutionDesc'),
  },
  {
    title: t('services.delivery'),
    desc: t('services.deliveryDesc'),
  },
  {
    title: t('services.service'),
    desc: t('services.serviceDesc'),
  },
]);
</script>
