export default defineNuxtPlugin(() => {
  const i18n = useI18n();
  
  // Инициализируем язык из localStorage при загрузке на клиенте
  if (process.client) {
    try {
      const savedLocale = localStorage.getItem('locale');
      if (savedLocale && (savedLocale === 'ru' || savedLocale === 'kk')) {
        if (savedLocale !== i18n.locale.value) {
          i18n.setLocale(savedLocale);
        }
      }
    } catch (e) {
      console.warn('Failed to read locale from localStorage:', e);
    }
  }
  
  return {
    provide: {
      t: i18n.t
    }
  };
});
