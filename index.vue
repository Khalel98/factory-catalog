<template>
  <div>
    <section class="hero section">
      <div class="card">
        <span class="pill">ФАРМЭК — безопасность в приоритете</span>
        <h1>Газоанализаторы и системы контроля для промышленных объектов</h1>
        <p class="muted">
          Проектируем, производим и обслуживаем приборы для мониторинга
          загазованности, утечек и безопасности. Поможем подобрать решение под
          ваш объект и требуемые среды.
        </p>
        <div class="cta-block">
          <NuxtLink to="/catalog" class="btn primary"
            >Смотреть каталог</NuxtLink
          >
          <NuxtLink to="/contacts" class="btn ghost"
            >Получить консультацию</NuxtLink
          >
        </div>
        <div class="split" style="margin-top: 16px">
          <div class="stat">
            <strong>30+ лет</strong>
            <span class="muted">опыт разработки и сервисного обслуживания</span>
          </div>
          <div class="stat">
            <strong>12 категорий</strong>
            <span class="muted"
              >оборудования для промышленных и бытовых объектов</span
            >
          </div>
          <div class="stat">
            <strong>Сервис 24/7</strong>
            <span class="muted">техподдержка и оперативный ремонт</span>
          </div>
        </div>
      </div>

      <div class="card highlight">
        <h3>Подбор газоанализатора</h3>
        <p class="muted">
          По веществу или сфере применения — выберите нужный критерий.
        </p>
        <div class="badge-grid">
          <span class="badge">Метан (CH4)</span>
          <span class="badge">Пропан (C3H8)</span>
          <span class="badge">Сероводород (H2S)</span>
          <span class="badge">Монооксид углерода (CO)</span>
          <span class="badge">Кислород (O2)</span>
          <span class="badge">Парковки и автостоянки</span>
          <span class="badge">Котельные</span>
          <span class="badge">Нефтегазовый сектор</span>
        </div>
        <div class="cta-block" style="margin-top: 14px">
          <NuxtLink to="/catalog" class="btn primary"
            >Перейти к подбору</NuxtLink
          >
          <NuxtLink to="/services" class="btn ghost"
            >Узнать про услуги</NuxtLink
          >
        </div>
      </div>
    </section>

    <section class="section">
      <div class="split">
        <div class="card">
          <h3>Комплект оперативного мониторинга</h3>
          <p class="muted">
            Программно-аппаратный комплекс для передачи данных при контроле
            воздушной среды и предотвращения аварийных ситуаций.
          </p>
          <ul class="list">
            <li>
              <strong>Портативные модули</strong> — работают в связке с ПО
            </li>
            <li>
              <strong>Сенсоры давления</strong> — подключаются к выносным блокам
            </li>
            <li>
              <strong>Сервисная поддержка</strong> — настройка, калибровка,
              ремонт
            </li>
          </ul>
        </div>
        <div class="card">
          <h3>Новости и обновления</h3>
          <p class="muted">
            Новые линейки ФП23, ФП34 и индикаторы утечки газа ФТ04 уже доступны
            для заказа и поставки.
          </p>
          <div class="list">
            <li><strong>ФП23</strong> — 1–5 компонентов, выносные датчики</li>
            <li><strong>ФП34</strong> — проверенная классика</li>
            <li>
              <strong>ФТ04</strong> — быстрая смена сенсора без калибровки
            </li>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Категории каталога</h2>
        <p class="muted">
          Оборудование для мониторинга загазованности и безопасности.
        </p>
      </div>
      <div class="grid">
        <div v-for="category in categories" :key="category.title" class="card">
          <h3>{{ category.title }}</h3>
          <p class="muted">{{ category.desc }}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Почему выбирают нас</h2>
      <div class="grid">
        <div v-for="item in benefits" :key="item.title" class="card">
          <h3>{{ item.title }}</h3>
          <p class="muted">{{ item.desc }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
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

const benefits = [
  {
    title: "Собственная разработка и производство",
    desc: "Все приборы выпускаются с соблюдением метрологических требований.",
  },
  {
    title: "Полный цикл сервиса",
    desc: "Поверка, ремонт, калибровка и техническая поддержка 24/7.",
  },
  {
    title: "Опыт 30+ лет",
    desc: "Десятки тысяч поставок, решения для промышленности и ЖКХ.",
  },
  {
    title: "Сертифицированное оборудование",
    desc: "Документация, подтверждающая соответствие стандартам.",
  },
];
</script>
