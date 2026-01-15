<template>
  <div class="home-page">
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

    <!-- Benefits Section -->
    <section class="section benefits-section">
      <h2 class="section-title">{{ t('home.whyChoose') }}</h2>
      <div class="grid benefits-grid">
        <div v-for="(item, index) in benefits" :key="item.title" class="card benefit-card">
          <div class="benefit-icon" :style="{ '--delay': index * 0.1 + 's' }">
            <svg v-if="index === 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <svg v-else-if="index === 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <svg v-else-if="index === 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 12l2 2 4-4"></path>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
              <path d="M12 21c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
              <path d="M12 3c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
            </svg>
          </div>
          <h3>{{ item.title }}</h3>
          <p class="muted">{{ item.desc }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
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

const benefits = computed(() => [
  {
    title: t('home.ownDevelopment'),
    desc: t('home.ownDesc'),
  },
  {
    title: t('home.fullCycle'),
    desc: t('home.fullCycleDesc'),
  },
  {
    title: t('home.experience30'),
    desc: t('home.experienceDesc'),
  },
  {
    title: t('home.certified'),
    desc: t('home.certifiedDesc'),
  },
]);
</script>

<style lang="scss" scoped>
.home-page {

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

  .benefits-section {
    .section-title {
      text-align: center;
      margin-bottom: 40px;
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #1f2933, #52606d);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .benefits-grid {
      gap: 24px;
    }

    .benefit-card {
      text-align: center;
      padding: 32px 24px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #1e88e5, #1565c0);
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 16px 48px rgba(30, 136, 229, 0.2);

        &::before {
          transform: scaleX(1);
        }

        .benefit-icon {
          transform: scale(1.1) rotate(5deg);
        }
      }
    }

    .benefit-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(30, 136, 229, 0.1), rgba(30, 136, 229, 0.05));
      border-radius: 18px;
      color: #1e88e5;
      transition: all 0.3s ease;
      animation: fadeInUp 0.6s ease var(--delay, 0s) both;

      svg {
        width: 36px;
        height: 36px;
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
    padding-top: 24px;

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

    .benefits-section {
      .section-title {
        font-size: 24px;
        margin-bottom: 24px;
      }

      .benefit-card {
        padding: 24px 18px;
      }
    }
  }
}
</style>
