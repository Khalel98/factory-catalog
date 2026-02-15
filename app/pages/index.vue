<template>
  <div class="home-page">
    <!-- Gazservice-7 Hero Section -->
    <section class="gazservice-hero" :style="{ backgroundImage: `url(${mainBgImage})` }">
      <div class="gazservice-hero-content">
        <h1 class="gazservice-title">{{ t('home.heroTitle') }}</h1>
        <h2 class="gazservice-subtitle">{{ t('home.heroSubtitle') }}</h2>
        <p class="gazservice-description">{{ t('home.heroDescription') }}</p>
        <div class="gazservice-cta">
          <NuxtLink to="/about#advantages" class="btn gazservice-btn">{{ t('home.advantagesBtn') }}</NuxtLink>
          <NuxtLink to="/contacts" class="btn gazservice-btn">{{ t('home.contactUsBtn') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Company Info Section -->
    <section class="company-info section">
      <div class="company-info-container">
        <div class="company-image-wrapper">
          <img 
            :src="productionImage" 
            alt="Производство" 
            class="company-image"
          />
        </div>
        <div class="company-text">
          <h2 class="company-title">{{ t('home.companyTitle') }}</h2>
          <h3 class="company-subtitle">{{ t('home.companySubtitle') }}</h3>
          <p class="company-description">{{ t('home.companyDescription1') }}</p>
          <p class="company-description">{{ t('home.companyDescription2') }}</p>
          <NuxtLink to="/about" class="btn company-btn">{{ t('home.moreDetailsBtn') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Hero Section -->
    <section class="hero section">
      <div class="hero-main card">
        <span class="pill">{{ t('home.pill') }}</span>
        <h1>{{ t('home.title') }}</h1>
        <p class="muted hero-subtitle">
          {{ t('home.subtitle') }}
        </p>
        <div class="cta-block">
          <NuxtLink to="/catalog" class="btn primary"
            >{{ t('home.viewCatalog') }}</NuxtLink
          >
          <NuxtLink to="/contacts" class="btn ghost"
            >{{ t('home.getConsultation') }}</NuxtLink
          >
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div class="stat-content">
              <strong>{{ t('home.years30') }}</strong>
              <span class="muted">{{ t('home.experienceDev') }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <div class="stat-content">
              <strong>{{ t('home.categories12') }}</strong>
              <span class="muted">{{ t('home.equipment') }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <strong>{{ t('home.service24') }}</strong>
              <span class="muted">{{ t('home.techSupport') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="hero-selection card highlight">
        <div class="selection-header">
          <div class="selection-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3>{{ t('home.selection') }}</h3>
        </div>
        <p class="muted">
          {{ t('home.selectionDesc') }}
        </p>
        <div class="badge-grid">
          <span class="badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Метан (CH4)
          </span>
          <span class="badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Пропан (C3H8)
          </span>
          <span class="badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Сероводород (H2S)
          </span>
          <span class="badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Монооксид углерода (CO)
          </span>
          <span class="badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Кислород (O2)
          </span>
          <span class="badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            </svg>
            Парковки и автостоянки
          </span>
          <span class="badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            Котельные
          </span>
          <span class="badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            Нефтегазовый сектор
          </span>
        </div>
        <div class="cta-block" style="margin-top: 14px">
          <NuxtLink to="/catalog" class="btn primary"
            >{{ t('home.goToSelection') }}</NuxtLink
          >
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="section features-section">
      <div class="split">
        <div class="card feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <h3>{{ t('home.monitoringKit') }}</h3>
          <p class="muted">
            {{ t('home.monitoringDesc') }}
          </p>
          <ul class="list">
            <li>
              <div class="list-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <strong>{{ t('home.portableModules') }}</strong> — {{ t('home.portableDesc') }}
              </div>
            </li>
            <li>
              <div class="list-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <strong>{{ t('home.pressureSensors') }}</strong> — {{ t('home.pressureDesc') }}
              </div>
            </li>
            <li>
              <div class="list-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <strong>{{ t('home.serviceSupport') }}</strong> — {{ t('home.serviceDesc') }}
              </div>
            </li>
          </ul>
        </div>
        <div class="card feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3>{{ t('home.news') }}</h3>
          <p class="muted">
            {{ t('home.newsDesc') }}
          </p>
          <div class="list">
            <li>
              <div class="list-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <strong>ФП23</strong> — 1–5 компонентов, выносные датчики
              </div>
            </li>
            <li>
              <div class="list-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <strong>ФП34</strong> — проверенная классика
              </div>
            </li>
            <li>
              <div class="list-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <strong>ФТ04</strong> — быстрая смена сенсора без калибровки
              </div>
            </li>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import productionImage from '@/assets/company/production.jpg';
import mainBgImage from '@/assets/company/main-bg.jpg';

const { t } = useI18n();

const categories = [
  {
    title: "Портативные газоанализаторы",
    desc: "Контроль утечек и концентраций на объекте и в полевых условиях.",
  },
  {
    title: "Стационарные газоанализаторы",
    desc: "Непрерывный мониторинг с подключением к системам безопасности.",
  },
  {
    title: "Сигнализаторы загазованности (бытовые)",
    desc: "Оповещение о превышении ПДК в жилых и общественных помещениях.",
  },
  {
    title: "Измерители давления газа",
    desc: "Точное измерение и диагностика параметров газовых сетей.",
  },
  {
    title: "Течеискатели и индикаторы",
    desc: "Поиск мест утечки с гибкими уровнями чувствительности.",
  },
  {
    title: "Трассоискатели",
    desc: "Локация и трассировка подземных коммуникаций и утечек.",
  },
  {
    title: "Сервисное и доп. оборудование",
    desc: "Аксессуары, блоки питания, станции калибровки.",
  },
  {
    title: "Газочувствительные элементы",
    desc: "Сенсоры и расходники для поддержания приборов в работе.",
  },
  {
    title: "Комплекты мониторинга",
    desc: "Готовые решения для мобильного и стационарного контроля.",
  },
  {
    title: "Архив изделий",
    desc: "Приборы, снятые с производства, с поддержкой и сервисом.",
  },
];

</script>

<style lang="scss" scoped>
.home-page {
  // Gazservice-7 Hero Section
  .gazservice-hero {
    position: relative;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    min-height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.9) 50%, rgba(26, 26, 26, 0.9) 100%);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow: hidden;
    padding: 80px 20px;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.55) 100%);
      pointer-events: none;
      z-index: 0;
    }

    .gazservice-hero-content {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      width: 100%;
      text-align: center;
      color: white;
      margin: 0 auto;
    }

    .gazservice-title {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
      color: white;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    .gazservice-subtitle {
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 24px;
      color: white;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }

    .gazservice-description {
      font-size: 18px;
      line-height: 1.8;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 40px;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      max-width: 900px;
      margin-left: auto;
      margin-right: auto;
    }

    .gazservice-cta {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .gazservice-btn {
      padding: 14px 32px;
      font-size: 16px;
      font-weight: 600;
      background: linear-gradient(135deg, #1e88e5, #1565c0);
      color: white;
      border: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(30, 136, 229, 0.4);
        background: linear-gradient(135deg, #2196f3, #1976d2);
      }
    }
  }

  // Company Info Section
  .company-info {
    background: transparent;
    padding: 60px 20px;

    .company-info-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 50px;
      align-items: center;
    }

    .company-image-wrapper {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
      }
    }

    .company-image {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
      min-height: 300px;
    }

    .company-text {
      padding: 0;
    }

    .company-title {
      font-size: 28px;
      font-weight: 700;
      color: #1f2933;
      margin-bottom: 10px;
      line-height: 1.3;
    }

    .company-subtitle {
      font-size: 18px;
      font-weight: 600;
      color: #52606d;
      margin-bottom: 20px;
      line-height: 1.4;
    }

    .company-description {
      font-size: 14px;
      line-height: 1.7;
      color: #52606d;
      margin-bottom: 16px;
    }

    .company-btn {
      padding: 12px 28px;
      font-size: 14px;
      font-weight: 600;
      background: linear-gradient(135deg, #1e88e5, #1565c0);
      color: white;
      border: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      margin-top: 12px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(30, 136, 229, 0.4);
        background: linear-gradient(135deg, #2196f3, #1976d2);
      }
    }
  }

  @media (max-width: 968px) {
    .company-info {
      .company-info-container {
        grid-template-columns: 1fr;
        gap: 35px;
      }

      .company-image-wrapper {
        order: 2;
      }

      .company-text {
        order: 1;
      }
    }
  }

  @media (max-width: 767.98px) {
    .gazservice-hero {
      min-height: 500px;
      padding: 60px 20px;

      .gazservice-title {
        font-size: 36px;
      }

      .gazservice-subtitle {
        font-size: 28px;
      }

      .gazservice-description {
        font-size: 16px;
      }

      .gazservice-cta {
        flex-direction: column;
        align-items: stretch;

        .gazservice-btn {
          width: 100%;
        }
      }
    }

    .company-info {
      padding: 40px 20px;

      .company-info-container {
        gap: 30px;
      }

      .company-title {
        font-size: 24px;
      }

      .company-subtitle {
        font-size: 16px;
      }

      .company-description {
        font-size: 13px;
      }

      .company-btn {
        padding: 10px 24px;
        font-size: 13px;
      }
    }
  }

  .hero {
    .hero-main {
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(30, 136, 229, 0.08) 0%, transparent 70%);
        pointer-events: none;
      }
    }

    .hero-subtitle {
      font-size: 1.1rem;
      line-height: 1.7;
      margin-bottom: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }

    .stat-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: linear-gradient(135deg, rgba(30, 136, 229, 0.06), rgba(30, 136, 229, 0.02));
      border-radius: 12px;
      border: 1px solid rgba(30, 136, 229, 0.1);
      transition: all 0.3s ease;
      min-width: 0;
      word-wrap: break-word;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(30, 136, 229, 0.15);
        border-color: rgba(30, 136, 229, 0.3);
      }
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e88e5, #1565c0);
      border-radius: 10px;
      color: white;
      flex-shrink: 0;

      svg {
        width: 20px;
        height: 20px;
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      flex: 1;

      strong {
        font-size: 18px;
        color: #1f2933;
        line-height: 1.3;
        word-break: break-word;
      }

      .muted {
        font-size: 13px;
        line-height: 1.4;
        word-break: break-word;
      }
    }

    .hero-selection {
      .selection-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .selection-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #1e88e5, #1565c0);
        border-radius: 12px;
        color: white;

        svg {
          width: 24px;
          height: 24px;
        }
      }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(30, 136, 229, 0.2);
      border-radius: 10px;
      font-weight: 500;
      color: #1f2933;
      transition: all 0.2s ease;
      font-size: 14px;

      svg {
        flex-shrink: 0;
        color: #1e88e5;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.9);
        border-color: #1e88e5;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(30, 136, 229, 0.2);
      }
    }
  }

  .features-section {
    .feature-card {
      position: relative;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(17, 24, 39, 0.15);
      }
    }

    .feature-icon {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(30, 136, 229, 0.1), rgba(30, 136, 229, 0.05));
      border-radius: 14px;
      margin-bottom: 20px;
      color: #1e88e5;

      svg {
        width: 28px;
        height: 28px;
      }
    }

    .list {
      li {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid rgba(229, 231, 235, 0.5);

        &:last-child {
          border-bottom: none;
        }
      }

      .list-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(30, 136, 229, 0.1);
        border-radius: 6px;
        color: #1e88e5;
        flex-shrink: 0;
        margin-top: 2px;

        svg {
          width: 14px;
          height: 14px;
        }
      }
    }
  }

}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 767.98px) {
  .home-page {
    .hero {
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .stat-card {
        padding: 14px;
        flex-direction: row;
        align-items: flex-start;
      }

      .stat-content {
        strong {
          font-size: 16px;
        }

        .muted {
          font-size: 12px;
        }
      }
    }

  }
}
</style>
