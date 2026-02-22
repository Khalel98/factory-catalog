export default defineNuxtPlugin(() => {
  const i18n = useI18n();
  return {
    provide: {
      t: i18n.t
    }
  };
});
