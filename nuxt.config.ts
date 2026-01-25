// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@/assets/styles/main.scss'],
  srcDir: 'app',
  runtimeConfig: {
    public: {
      // URL Google Forms опросника
      // Для встраивания используется ?embedded=true вместо ?usp=publish-editor
      googleFormUrl: process.env.GOOGLE_FORM_URL || 'https://docs.google.com/forms/d/e/1FAIpQLSekBcahye-u5f7GHg5DyCkmuGLjs3gTIq4YzEKFccD1iNzvmQ/viewform?embedded=true'
    }
  }
})
