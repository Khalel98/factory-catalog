<template>
  <div>
    <header class="site-header">
      <div class="top-bar">
        <div class="container">
          <NuxtLink to="/" class="logo">ФАРМЭК</NuxtLink>
          <span>г. Минск, ул. Жилуновича 2В — офис-склад</span>
          <div class="cta-block">
            <span class="muted">Отдел продаж: +375 (17) 252-22-11</span>
            <button class="btn ghost">Обратный звонок</button>
          </div>
        </div>
      </div>

      <div class="container nav-bar">
        <NuxtLink to="/" class="nav-logo">ФАРМЭК</NuxtLink>
        <nav
          class="main-nav"
          :class="{ 'mobile-open': isMobileMenuOpen }"
          aria-label="Основная навигация"
        >
          <ul>
            <li>
              <NuxtLink to="/" @click="closeMobileMenu">{{ t('nav.home') }}</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/catalog" @click="closeMobileMenu"
                >{{ t('nav.catalog') }}</NuxtLink
              >
            </li>
            <li class="has-submenu" :class="{ 'is-active': isInformationActive }">
              <div class="submenu-toggle-wrapper">
                <NuxtLink 
                  to="/information" 
                  class="submenu-toggle"
                  :class="{ 'router-link-active': isInformationActive }"
                >
                  {{ t('nav.information') }}
                </NuxtLink>
                <button 
                  v-if="isMobile"
                  class="submenu-arrow-btn"
                  @click="toggleSubmenu($event)"
                  aria-label="Toggle submenu"
                >
                  <svg 
                    class="submenu-arrow" 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <svg 
                  v-else
                  class="submenu-arrow" 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <ul class="submenu">
                <li>
                  <NuxtLink to="/information/videos" @click="closeMobileMenu">
                    {{ t('nav.videos') }}
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/information/catalogs" @click="closeMobileMenu">
                    {{ t('nav.catalogs') }}
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/information/reviews" @click="closeMobileMenu">
                    {{ t('nav.reviews') }}
                  </NuxtLink>
                </li>
              </ul>
            </li>
            <li>
              <NuxtLink to="/about" @click="closeMobileMenu">{{ t('nav.about') }}</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contacts" @click="closeMobileMenu"
                >{{ t('nav.contacts') }}</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/admin/update-catalog" @click="closeMobileMenu"
                >{{ t('nav.updateCatalog') }}</NuxtLink
              >
            </li>
          </ul>
        </nav>
        <div class="nav-actions">
          <LanguageSwitcher />
        </div>
        <button
          class="mobile-menu-toggle"
          @click="toggleMobileMenu"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Переключить меню"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
        <div
          v-if="isMobileMenuOpen"
          class="mobile-menu-overlay"
          @click="closeMobileMenu"
        ></div>
      </div>
    </header>

    <main class="container">
      <slot />
    </main>

    <footer class="footer">
      <div class="container footer-columns">
        <div>
          <h4>{{ t('footer.title') }}</h4>
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
            <span>sales@pharmec.by</span>
            <span>+375 (17) 252-22-11 ({{ t('footer.sales') }})</span>
            <span class="muted">{{ t('footer.workingHours') }}</span>
          </div>
        </div>
        <div>
          <h4>{{ t('footer.social') }}</h4>
          <div class="list">
            <a href="https://www.youtube.com" target="_blank" rel="noopener"
              >{{ t('footer.youtube') }}</a
            >
            <a href="https://t.me" target="_blank" rel="noopener">{{ t('footer.telegram') }}</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const { t } = useI18n();
const route = useRoute();

const isMobileMenuOpen = ref(false);
const isMobile = ref(false);

const isInformationActive = computed(() => {
  return route.path.startsWith('/information');
});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  // Блокируем скролл страницы когда меню открыто
  if (typeof window !== "undefined") {
    if (isMobileMenuOpen.value) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  if (typeof window !== "undefined") {
    document.body.classList.remove("menu-open");
  }
};

const toggleSubmenu = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  const target = event.currentTarget as HTMLElement;
  const li = target.closest('li');
  if (li) {
    li.classList.toggle('submenu-open');
  }
};

const checkMobile = () => {
  if (typeof window !== "undefined") {
    isMobile.value = window.innerWidth <= 768;
  }
};

onMounted(() => {
  checkMobile();
  const handleResize = () => {
    checkMobile();
    if (window.innerWidth > 768) {
      isMobileMenuOpen.value = false;
      document.body.classList.remove("menu-open");
    }
  };
  window.addEventListener("resize", handleResize);
  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    document.body.classList.remove("menu-open");
  });
});

</script>
