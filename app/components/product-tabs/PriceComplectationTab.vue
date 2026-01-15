<template>
  <div class="tab-panel">
    <div v-if="!hasContent" class="empty-content">
      <p>Информация о ценах и комплектации будет добавлена позже</p>
    </div>
    <div v-else class="content">
      <div v-html="content"></div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  content: {
    type: String,
    default: "",
  },
});

const hasContent = computed(() => {
  return props.content && props.content.trim() !== "";
});
</script>

<style scoped>
.tab-panel {
  font-size: 1rem;
  line-height: 1.8;
  color: #52606d;
}

.empty-content {
  color: #9ca3af;
  font-style: italic;
  text-align: center;
  padding: 40px 20px;
}

.content {
  line-height: 1.8;
}

.content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  border: 1px solid #e5e7eb;
}

.content :deep(table th) {
  background: transparent !important;
  border: 1px solid #e5e7eb;
  padding: 12px;
  font-weight: 600;
  text-align: left;
  color: #1f2933;
}

.content :deep(table td) {
  border: 1px solid #e5e7eb;
  padding: 12px;
  color: #52606d;
  background: transparent;
}

.content :deep(table tbody tr:nth-child(even)) {
  background: #f5f5f5;
}

.content :deep(table tbody tr:nth-child(even) td) {
  background: #f5f5f5;
}
</style>
