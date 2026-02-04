<template>
  <HtmlContentEditor
    :content="getKit()"
    :content-r-u="kitRU"
    :content-k-k="kitKK"
    :product-id="productId"
    :category-id="categoryId"
    api-endpoint="/api/update-product-kit"
    translation-key="kit"
    api-field-name="kit"
    placeholder="Введите комплект поставки..."
    empty-message="Информация о комплекте поставки будет добавлена позже"
  />
</template>

<script setup>
import { computed } from "vue";
import HtmlContentEditor from "@/components/HtmlContentEditor.vue";

const { locale } = useI18n();

const props = defineProps({
  kit: {
    type: String,
    default: "",
  },
  kitRU: {
    type: String,
    default: "",
  },
  kitKK: {
    type: String,
    default: "",
  },
  productId: {
    type: String,
    default: "",
  },
  categoryId: {
    type: String,
    default: "",
  },
});

// Функция для получения локализованного kit
const getKit = () => {
  const currentLang = locale.value;
  if (currentLang === "kk" && props.kitKK) {
    return props.kitKK;
  }
  // По умолчанию русское
  return props.kitRU || props.kit || "";
};
</script>

<style scoped>
/* Стили наследуются от HtmlContentEditor */
</style>
