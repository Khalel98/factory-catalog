import ru from '@/locales/ru.json';
import kk from '@/locales/kk.json';

const translations = {
  ru,
  kk
};

export const useI18n = () => {
  const locale = useState('locale', () => 'ru');
  
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[locale.value];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Замена параметров
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match;
    });
  };
  
  const setLocale = (newLocale) => {
    if (translations[newLocale]) {
      locale.value = newLocale;
      if (process.client) {
        try {
          localStorage.setItem('locale', newLocale);
        } catch (e) {
          console.warn('Failed to save locale to localStorage:', e);
        }
      }
    }
  };
  
  const currentLocale = computed(() => locale.value);
  
  return {
    t,
    locale: currentLocale,
    setLocale,
    availableLocales: ['ru', 'kk']
  };
};
