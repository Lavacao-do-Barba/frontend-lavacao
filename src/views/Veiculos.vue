<script setup>
import { ref } from 'vue'
import api from '../services/api'

const placaBusca = ref('')
const historico = ref([])
const carregando = ref(false)
const buscou = ref(false)
const erro = ref('')

async function buscarHistorico() {
  if (!placaBusca.value) return
  carregando.value = true
  erro.value = ''
  buscou.value = true
  try {
    const response = await api.get('/api/lavagens/', {
      params: { placa: placaBusca.value },
    })
    historico.value = response.data.results
  } catch (e) {
    erro.value = 'Não foi possível buscar o histórico.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="veiculos">
    <div class="veiculos__header">
      <h1>Veículos</h1>
      <p class="veiculos__subtitulo">Histórico de lavagens por placa</p>
    </div>

    <form class="veiculos__busca" @submit.prevent="buscarHistorico">
      <input v-model="placaBusca" type="text" placeholder="Digite a placa" />
      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Buscando...' : 'Buscar' }}
      </button>
    </form>

    <p v-if="erro" class="veiculos__erro">{{ erro }}</p>

    <table v-if="buscou && !carregando" class="veiculos__tabela">
      <thead>
        <tr>
          <th>Placa</th>
          <th>Valor</th>
          <th>Pagamento</th>
          <th>Entrada</th>
          <th>Saída</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="l in historico" :key="l.id">
          <td>{{ l.caminhao_placa }}</td>
          <td>R$ {{ Number(l.valor).toFixed(2) }}</td>
          <td>{{ l.forma_pagamento }}</td>
          <td>{{ new Date(l.horario_entrada).toLocaleString('pt-BR') }}</td>
          <td>{{ l.horario_saida ? new Date(l.horario_saida).toLocaleString('pt-BR') : '—' }}</td>
        </tr>
        <tr v-if="historico.length === 0">
          <td colspan="5" class="veiculos__vazio">Nenhuma lavagem encontrada para essa placa.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.veiculos {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.veiculos__header {
  margin-bottom: 1.5rem;
}

.veiculos__subtitulo {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.veiculos__busca {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.veiculos__busca input {
  flex: 1;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.veiculos__busca button {
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.veiculos__busca button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.veiculos__tabela {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
}

.veiculos__tabela th,
.veiculos__tabela td {
  text-align: left;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.veiculos__tabela th {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.veiculos__tabela tbody tr:last-child td {
  border-bottom: none;
}

.veiculos__vazio {
  text-align: center;
  color: var(--text-secondary);
}

.veiculos__erro {
  color: var(--danger);
}
</style>