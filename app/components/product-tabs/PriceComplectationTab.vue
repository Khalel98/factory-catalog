<template>
  <HtmlContentEditor
    :content="getPriceComplectation()"
    :content-r-u="contentRU"
    :content-k-k="contentKK"
    :product-id="productId"
    :category-id="categoryId"
    api-endpoint="/api/update-product-price-complectation"
    translation-key="priceComplectation"
    api-field-name="priceComplectation"
    placeholder="Введите информацию о ценах и комплектации..."
    empty-message="Информация о ценах и комплектации будет добавлена позже"
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
  contentRU: {
    type: String,
    default: "",
  },
  contentKK: {
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

// Функция для получения локализованного priceComplectation
const getPriceComplectation = () => {
  const currentLang = locale.value;
  if (currentLang === "kk" && props.contentKK) {
    return props.contentKK;
  }
  // По умолчанию русское
  return props.contentRU || props.content || "";
};
</script>

<style scoped>
/* Стили наследуются от HtmlContentEditor */
</style>
