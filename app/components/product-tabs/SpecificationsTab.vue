<template>
  <HtmlContentEditor
    :content="getSpecifications()"
    :content-r-u="specificationsRU"
    :content-k-k="specificationsKK"
    :product-id="productId"
    :category-id="categoryId"
    api-endpoint="/api/update-product-specifications"
    translation-key="specifications"
    api-field-name="specifications"
    placeholder="Введите технические характеристики..."
    empty-message="Технические характеристики будут добавлены позже"
  />
</template>

<script setup>
import { computed } from "vue";
import HtmlContentEditor from "@/components/HtmlContentEditor.vue";

const { locale } = useI18n();

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  specificationsRU: {
    type: String,
    default: "",
  },
  specificationsKK: {
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

// Функция для получения локализованных спецификаций
const getSpecifications = () => {
  const currentLang = locale.value;
  if (currentLang === "kk" && props.specificationsKK) {
    return props.specificationsKK;
  }
  // По умолчанию русское
  return props.specificationsRU || props.content || "";
};
</script>

<style scoped>
/* Стили наследуются от HtmlContentEditor */
</style>
