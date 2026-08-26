<script setup>
defineProps({
  titulo: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <header class="header">
    <h1>{{ titulo }}</h1>
  </header>
</template>

<style scoped>
.header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e2e2;
  background: #fff;
}
</style>