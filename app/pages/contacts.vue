<template>
  <div>
    <section class="section">
      <div class="card">
        <h1>{{ t('contacts.title') }}</h1>
        <p class="muted">
          {{ t('contacts.subtitle') }}
        </p>
        <div class="split" style="margin-top: 12px">
          <div class="contact-card">
            <strong>{{ t('contacts.sales') }}</strong>
            <span>+375 (17) 252-22-11</span>
            <span>+375 (33) 377-84-37</span>
            <span>sales@pharmec.by</span>
          </div>
          <div class="contact-card">
            <strong>{{ t('contacts.techSupport') }}</strong>
            <span>+375 (33) 681-12-81</span>
            <span>techsupport@pharmec.by</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section split">
      <div class="card">
        <h3>{{ t('contacts.schedule') }}</h3>
        <p class="muted">
          {{ t('contacts.scheduleText') }}<br />
          {{ t('contacts.lunch') }}<br />
          {{ t('contacts.shipment') }}
        </p>
      </div>
      <div class="card">
        <h3>{{ t('contacts.address') }}</h3>
        <p class="muted">{{ t('contacts.addressText') }}</p>
        <p class="muted">{{ t('contacts.addressDesc') }}</p>
      </div>
      <div class="card">
        <h3>{{ t('contacts.contactUs') }}</h3>
        <p class="muted">
          {{ t('contacts.contactDesc') }}
        </p>
        <div class="cta-block">
          <NuxtLink to="/contacts" class="btn primary"
            >{{ t('contacts.orderCall') }}</NuxtLink
          >
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener"
            class="btn ghost"
            >{{ t('contacts.writeTelegram') }}</a
          >
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const { t } = useI18n();
</script>
