<script setup>
defineProps({
  titulo: String,
  valor: [String, Number],
})
</script>

<template>
  <div class="card-resumo">
    <span class="card-resumo__titulo">{{ titulo }}</span>
    <span class="card-resumo__valor">{{ valor }}</span>
  </div>
</template>

<style scoped>
.card-resumo {
  background: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.card-resumo__titulo {
  font-size: 0.85rem;
  color: #666;
}

.card-resumo__valor {
  font-size: 1.75rem;
  font-weight: 700;
}
</style>