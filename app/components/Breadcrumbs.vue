<template>
  <nav class="breadcrumbs" v-if="items && items.length > 0">
    <template v-for="(item, index) in items" :key="index">
      <NuxtLink v-if="item.to" :to="item.to" class="breadcrumb-link">
        {{ item.label }}
      </NuxtLink>
      <span v-else class="breadcrumb-text">{{ item.label }}</span>
      <span v-if="index < items.length - 1" class="breadcrumb-separator"
        >/</span
      >
    </template>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
});
</script>

<style scoped>
.breadcrumbs {
  margin: 0 0 24px 0;
  font-size: 0.98rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.breadcrumb-link {
  color: #16396C;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #16396C;
  text-decoration: underline;
}

.breadcrumb-text {
  color: #aaa;
}

.breadcrumb-separator {
  color: #aaa;
  margin: 0 2px;
}
</style>
