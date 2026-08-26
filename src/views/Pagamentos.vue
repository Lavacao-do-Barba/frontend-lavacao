<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const lavagens = ref([])
const carregando = ref(true)
const erro = ref('')

const resumoPorForma = computed(() => {
  const grupos = { dinheiro: 0, pix: 0, cartao: 0 }
  const contagem = { dinheiro: 0, pix: 0, cartao: 0 }
  for (const l of lavagens.value) {
    grupos[l.forma_pagamento] += Number(l.valor)
    contagem[l.forma_pagamento] += 1
  }
  return { grupos, contagem }
})

onMounted(async () => {
  try {
    const response = await api.get('/api/lavagens/')
    lavagens.value = response.data.results
  } catch (e) {
    erro.value = 'Não foi possível carregar os pagamentos.'
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <div class="pagamentos">
    <div class="pagamentos__header">
      <h1>Pagamentos</h1>
      <p class="pagamentos__subtitulo">Resumo por forma de pagamento</p>
    </div>

    <p v-if="erro" class="pagamentos__erro">{{ erro }}</p>
    <p v-if="carregando" class="pagamentos__status">Carregando...</p>

    <div v-else class="pagamentos__cards">
      <div class="pagamentos__card">
        <span class="pagamentos__titulo">Dinheiro</span>
        <span class="pagamentos__valor">R$ {{ resumoPorForma.grupos.dinheiro.toFixed(2) }}</span>
        <span class="pagamentos__contagem">{{ resumoPorForma.contagem.dinheiro }} lavagens</span>
      </div>
      <div class="pagamentos__card">
        <span class="pagamentos__titulo">Pix</span>
        <span class="pagamentos__valor">R$ {{ resumoPorForma.grupos.pix.toFixed(2) }}</span>
        <span class="pagamentos__contagem">{{ resumoPorForma.contagem.pix }} lavagens</span>
      </div>
      <div class="pagamentos__card">
        <span class="pagamentos__titulo">Cartão</span>
        <span class="pagamentos__valor">R$ {{ resumoPorForma.grupos.cartao.toFixed(2) }}</span>
        <span class="pagamentos__contagem">{{ resumoPorForma.contagem.cartao }} lavagens</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagamentos {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.pagamentos__header {
  margin-bottom: 1.5rem;
}

.pagamentos__subtitulo {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.pagamentos__cards {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.pagamentos__card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-width: 200px;
}

.pagamentos__titulo {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.pagamentos__valor {
  font-size: 1.75rem;
  font-weight: 700;
}

.pagamentos__contagem {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.pagamentos__erro {
  color: var(--danger);
}

.pagamentos__status {
  color: var(--text-secondary);
}
</style>