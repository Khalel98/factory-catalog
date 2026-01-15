<template>
  <div>
    <section class="section">
      <div class="card">
        <h1>{{ t('about.title') }}</h1>
        <p class="muted">
          {{ t('about.subtitle') }}
        </p>
        <div class="split" style="margin-top: 12px">
          <div class="stat">
            <strong>{{ t('about.founded') }}</strong>
            <span class="muted">{{ t('about.foundedText') }}</span>
          </div>
          <div class="stat">
            <strong>{{ t('about.delivered') }}</strong>
            <span class="muted">{{ t('about.deliveredText') }}</span>
          </div>
          <div class="stat">
            <strong>{{ t('about.certification') }}</strong>
            <span class="muted">{{ t('about.certificationText') }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>{{ t('about.principles') }}</h2>
      <div class="grid">
        <div v-for="item in principles" :key="item.title" class="card">
          <h3>{{ item.title }}</h3>
          <p class="muted">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>{{ t('about.directions') }}</h2>
      <div class="grid">
        <div v-for="dir in directions" :key="dir" class="card">
          <p><strong>{{ dir }}</strong></p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const principles = computed(() => [
  { title: t('about.ownDev'), desc: t('about.ownDevDesc') },
  { title: t('about.serviceSupport'), desc: t('about.serviceSupportDesc') },
  { title: t('about.industry'), desc: t('about.industryDesc') },
  { title: t('about.reliability'), desc: t('about.reliabilityDesc') }
]);

const directions = computed(() => [
  t('about.devProduction'),
  t('about.sensorsProduction'),
  t('about.engineering'),
  t('about.service'),
  t('about.training')
]);
</script>
