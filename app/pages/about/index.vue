<template>
  <div class="about-page spacing">
    <!-- Hero Section -->
    <section class="section hero-section">
      <div class="card hero-card">
        <span class="pill">{{ t('about.pill') }}</span>
        <h1>{{ t('about.title') }}</h1>
        <p class="hero-subtitle">
          {{ t('about.subtitle') }}
        </p>
      </div>
    </section>

    <!-- Company Description -->
    <section class="section">
      <div class="card content-card">
        <div class="content-text">
          <p v-for="(paragraph, index) in companyDescription" :key="index" class="paragraph">
            {{ paragraph }}
          </p>
        </div>
      </div>
    </section>

    <!-- Partners Section -->
    <section class="section">
      <div class="card partners-card">
        <h2>{{ t('about.partners') }}</h2>
        <p class="muted partners-intro">{{ t('about.partnersIntro') }}</p>
        <div class="partners-grid">
          <div
            v-for="partner in partners"
            :key="partner.name"
            class="partner-badge"
          >
            <img
              v-if="partner.logo"
              :src="partner.logo"
              :alt="partner.name"
              class="partner-logo"
              loading="lazy"
            />
            <span v-else class="partner-name">{{ partner.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Activities -->
    <section class="section">
      <h2 class="section-title">{{ t('about.activities') }}</h2>
      <div class="grid activities-grid">
        <div v-for="activity in activities" :key="activity" class="card activity-card">
          <div class="activity-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <p class="activity-text">{{ activity }}</p>
        </div>
      </div>
    </section>

    <!-- Advantages Section -->
    <section class="section advantages-section">
      <h2 class="section-title">{{ t('about.advantages') }}</h2>
      <div class="grid advantages-grid">
        <div v-for="(advantage, index) in advantages" :key="advantage.title" class="card advantage-card">
          <div class="advantage-header">
            <div class="advantage-icon">
              <!-- Official Dealer -->
              <svg v-if="index === 0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
              </svg>
              <!-- Wide Range -->
              <svg v-else-if="index === 1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                <path d="M12 8v13"></path>
                <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
                <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
              </svg>
              <!-- Quality Guarantee -->
              <svg v-else-if="index === 2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                <path d="M12 21v-8"></path>
                <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
              </svg>
              <!-- Certified Equipment -->
              <svg v-else-if="index === 3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
              </svg>
              <!-- Logistics Services -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 3h15v13H1z"></path>
                <path d="M16 8h4l3 3v5h-7V8z"></path>
                <path d="M7 20.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path>
                <path d="M20.5 20.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path>
              </svg>
            </div>
            <h3>{{ advantage.title }}</h3>
          </div>
          <p class="muted advantage-desc">{{ advantage.desc }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const companyDescription = computed(() => [
  t('about.description1'),
  t('about.description2'),
  t('about.description3')
]);

// Логотипы из assets/logos
const logoModules = import.meta.glob<string>('~/assets/logos/*', {
  eager: true,
  query: '?url',
  import: 'default'
});

function normalizeName(s: string): string {
  return s.normalize('NFC');
}

function getLogoUrl(filename: string): string | null {
  const fn = normalizeName(filename);
  const entry = Object.entries(logoModules).find(([path]) => {
    const base = path.split(/[/\\]/).pop() || '';
    return normalizeName(base) === fn;
  });
  if (!entry) return null;
  const val = entry[1];
  return typeof val === 'string' ? val : (val as { default?: string })?.default ?? null;
}

const LOGO_FILES: (string | null)[] = [
  'АО QazaqGaz Aimaq.png',
  'Мангистаумунайгаз.png',
  'KazTransOil.svg.png',
  'Алматинские электрические станции.png',
  'Интергаз Центральная Азия.png',
  'Eurasian Resources Group.svg',
  'Теплотранзит Караганда.png',
  'Алматинские тепловые сети.svg',
  'Озенмунайгаз.png',
  'МАЭК – Казатомпром.svg',
  null
];

const partners = computed(() => {
  const keys = [
    'about.partner1', 'about.partner2', 'about.partner3', 'about.partner4',
    'about.partner5', 'about.partner6', 'about.partner7', 'about.partner8',
    'about.partner9', 'about.partner10', 'about.partner11'
  ];
  return keys.map((key, i) => {
    const name = t(key);
    const logo = LOGO_FILES[i] ? getLogoUrl(LOGO_FILES[i]!) : null;
    return { name, logo };
  });
});

const activities = computed(() => [
  t('about.activity1'),
  t('about.activity2'),
  t('about.activity3')
]);

const advantages = computed(() => [
  {
    title: t('about.advantage1Title'),
    desc: t('about.advantage1Desc'),
  },
  {
    title: t('about.advantage2Title'),
    desc: t('about.advantage2Desc'),
  },
  {
    title: t('about.advantage3Title'),
    desc: t('about.advantage3Desc'),
  },
  {
    title: t('about.advantage4Title'),
    desc: t('about.advantage4Desc'),
  },
  {
    title: t('about.advantage5Title'),
    desc: t('about.advantage5Desc'),
  }
]);
</script>

<style scoped>
.about-page {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  margin-bottom: 48px;
}

.hero-card {
  background: linear-gradient(135deg, rgba(30, 136, 229, 0.12), #e0f2fe);
  border: 1px solid #bfdbfe;
  padding: 48px 32px;
  text-align: center;
}

.hero-card h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 16px 0;
  color: #1f2933;
}

.hero-subtitle {
  font-size: 18px;
  color: #52606d;
  line-height: 1.7;
  max-width: 800px;
  margin: 0 auto;
}

.content-card {
  padding: 32px;
}

.content-text {
  max-width: 900px;
  margin: 0 auto;
}

.paragraph {
  font-size: 16px;
  line-height: 1.8;
  color: #1f2933;
  margin-bottom: 20px;
}

.paragraph:last-child {
  margin-bottom: 0;
}

.partners-card {
  padding: 32px;
}

.partners-card h2 {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
}

.partners-intro {
  margin-bottom: 24px;
  font-size: 16px;
}

.partners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.partner-badge {
  padding: 20px 24px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-weight: 500;
  color: #1f2933;
  text-align: center;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.partner-logo {
  max-width: 100%;
  max-height: 64px;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

.partner-name {
  font-size: 0.95rem;
}

.partner-badge:hover {
  background: rgba(30, 136, 229, 0.08);
  border-color: #16396C;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.15);
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 32px;
  color: #1f2933;
}

.activities-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.activity-card {
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(17, 24, 39, 0.15);
  border-color: #16396C;
}

.activity-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: #16396C;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.activity-text {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: #1f2933;
  flex: 1;
}

.advantages-section {
  margin-top: 64px;
}

.advantages-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.advantage-card {
  padding: 28px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.advantage-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(17, 24, 39, 0.15);
  border-color: #16396C;
}

.advantage-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.advantage-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(30, 136, 229, 0.12), rgba(30, 136, 229, 0.08));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16396C;
  flex-shrink: 0;
}

.advantage-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2933;
  flex: 1;
}

.advantage-desc {
  font-size: 15px;
  line-height: 1.7;
  margin: 0;
}

@media (max-width: 767.98px) {
  .hero-card {
    padding: 32px 24px;
  }

  .hero-card h1 {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .content-card,
  .partners-card {
    padding: 24px;
  }

  .section-title {
    font-size: 26px;
  }

  .partners-grid {
    grid-template-columns: 1fr;
  }

  .activities-grid,
  .advantages-grid {
    grid-template-columns: 1fr;
  }

  .activity-card {
    padding: 20px;
  }

  .advantage-card {
    padding: 24px;
  }
}
</style>
