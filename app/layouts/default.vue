<template>
  <div :data-locale="locale">
    <SiteHeader />

    <main class="container">
      <slot />
    </main>

    <footer class="footer">
      <div class="container footer-columns">
        <div>
          <NuxtLink to="/" class="footer-logo">
            <img :src="logoImage" alt="Газсервис-7" class="footer-logo-img" />
          </NuxtLink>
          <p class="muted">
            {{ t('footer.description') }}
          </p>
          <div class="stat">
            <strong>{{ t('footer.years') }}</strong>
            <span class="muted">{{ t('footer.experience') }}</span>
          </div>
        </div>
        <div>
          <h4>{{ t('footer.navigation') }}</h4>
          <div class="list">
            <NuxtLink to="/catalog">{{ t('nav.catalog') }}</NuxtLink>
            <NuxtLink to="/information">{{ t('nav.information') }}</NuxtLink>
            <NuxtLink to="/about">{{ t('nav.about') }}</NuxtLink>
          </div>
        </div>
        <div>
          <h4>{{ t('footer.contacts') }}</h4>
          <div class="contact-card">
            <span>{{ t('footer.address') }}</span>
            <a :href="`tel:${t('footer.phoneLink')}`">{{ t('footer.phone') }}</a>
            <a :href="`mailto:${t('footer.email')}`">{{ t('footer.email') }}</a>
            <span class="muted">{{ t('footer.workingHours') }}</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import logoImage from '@/assets/company/logo.svg';

const { t, locale } = useI18n();
</script>
