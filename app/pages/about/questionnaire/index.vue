<template>
  <div class="questionnaire-page">
    <div class="google-form-container">
      <iframe
        :src="formUrl"
        width="100%"
        height="800"
        frameborder="0"
        marginheight="0"
        marginwidth="0"
        class="google-form-iframe"
      >
        {{ t('questionnaire.loading') }}
      </iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const { t } = useI18n();

const formUrl = ref('');

onMounted(() => {
  const config = useRuntimeConfig();
  if (config.public?.googleFormUrl) {
    formUrl.value = config.public.googleFormUrl;
  }
});
</script>

<style scoped>
.questionnaire-page {
  width: 100%;
  min-height: 100vh;
}

.google-form-container {
  width: 100%;
  min-height: 800px;
  margin: 0;
  overflow: hidden;
}

.google-form-iframe {
  width: 100%;
  min-height: 800px;
  border: none;
  display: block;
}

@media (max-width: 768px) {
  .google-form-container {
    min-height: 600px;
  }
  
  .google-form-iframe {
    min-height: 600px;
  }
}
</style>
