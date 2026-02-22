<template>
  <header class="site-header" :data-locale="locale">
    <div class="container nav-bar">
      <NuxtLink to="/" class="nav-logo">
        <img :src="logoImage" alt="Газсервис-7" class="nav-logo-img" />
      </NuxtLink>
      <nav
        class="main-nav"
        :class="{ 'mobile-open': isMobileMenuOpen }"
        aria-label="Основная навигация"
      >
        <div class="mobile-lang" :aria-label="t('header.selectLanguage')">
          <LanguageSwitcher />
        </div>
        <form
          v-if="isMobile"
          class="mobile-search-form"
          @submit.prevent="submitSearch"
          role="search"
        >
          <input
            v-model="searchQuery"
            type="search"
            class="mobile-search-input"
            :placeholder="searchPlaceholder"
            :aria-label="searchPlaceholder"
            autocomplete="off"
          />
          <button type="submit" class="mobile-search-btn" :aria-label="t('search.button')">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
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
                <NuxtLink to="/information/reviews" @click="closeMobileMenu">
                  {{ t('nav.reviews') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/information/documentation" @click="closeMobileMenu">
                  {{ t('nav.documentation') }}
                </NuxtLink>
              </li>
            </ul>
          </li>
          <li class="has-submenu" :class="{ 'is-active': isAboutActive }">
            <div class="submenu-toggle-wrapper">
              <NuxtLink 
                to="/about" 
                class="submenu-toggle"
                :class="{ 'router-link-active': isAboutActive }"
              >
                {{ t('nav.about') }}
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
                <NuxtLink to="/about/questionnaire" @click="closeMobileMenu">
                  {{ t('nav.questionnaire') }}
                </NuxtLink>
              </li>
            </ul>
          </li>
          <li>
            <NuxtLink to="/contacts" @click="closeMobileMenu"
              >{{ t('nav.contacts') }}</NuxtLink
            >
          </li>
          <li v-if="isAdmin">
            <NuxtLink to="/admin/update-catalog" @click="closeMobileMenu"
              >{{ t('nav.updateCatalog') }}</NuxtLink
            >
          </li>
          <li v-if="isAdmin">
            <NuxtLink to="/admin/substances" @click="closeMobileMenu"
              >Подбор веществ</NuxtLink
            >
          </li>
          <li v-if="isAdmin">
            <NuxtLink to="/admin/applications" @click="closeMobileMenu"
              >Подбор по сфере</NuxtLink
            >
          </li>
        </ul>
      </nav>
      <div class="nav-actions">
        <form class="header-search-form" @submit.prevent="submitSearch" role="search">
          <input
            v-model="searchQuery"
            type="search"
            class="header-search-input"
            :placeholder="searchPlaceholder"
            :aria-label="searchPlaceholder"
            autocomplete="off"
          />
          <button type="submit" class="header-search-btn" aria-label="Искать">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
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
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import logoImage from '@/assets/company/logo.svg';

const { t, locale } = useI18n();
const route = useRoute();

// Placeholder из localStorage + реакция на смену языка
const searchPlaceholder = ref('Поиск');
const updateSearchPlaceholder = () => {
  if (typeof window === 'undefined') return;
  const loc = localStorage.getItem('locale') || locale.value;
  searchPlaceholder.value = loc === 'kk' ? 'Іздеу' : 'Поиск';
};

const isMobileMenuOpen = ref(false);
const isMobile = ref(false);

const isInformationActive = computed(() => {
  return route.path.startsWith('/information');
});

const isAboutActive = computed(() => {
  return route.path.startsWith('/about');
});

const isAdmin = computed(() => {
  if (process.client) {
    return localStorage.getItem('isAdmin') === 'true';
  }
  return false;
});

const searchQuery = ref('');

// Синхронизация с URL при переходе на /search?q=...
watch(
  () => route.path === '/search' && route.query.q,
  (q) => {
    if (typeof q === 'string') searchQuery.value = q;
  },
  { immediate: true }
);

const submitSearch = () => {
  const q = searchQuery.value?.trim();
  if (!q) return;
  closeMobileMenu();
  navigateTo({ path: '/search', query: { q } });
};

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

watch(locale, updateSearchPlaceholder);

onMounted(() => {
  updateSearchPlaceholder();
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

