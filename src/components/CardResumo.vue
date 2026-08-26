<script setup>
defineProps({
  titulo: String,
  valor: [String, Number],
  variacao: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="card-resumo">
    <span class="card-resumo__titulo">{{ titulo }}</span>
    <span class="card-resumo__valor">{{ valor }}</span>
    <span v-if="variacao" class="card-resumo__variacao">{{ variacao }}</span>
  </div>
</template>

<style scoped>
.card-resumo {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-width: 200px;
}

.card-resumo__titulo {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.card-resumo__valor {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.card-resumo__variacao {
  font-size: 0.8rem;
  color: var(--success);
}
</style>