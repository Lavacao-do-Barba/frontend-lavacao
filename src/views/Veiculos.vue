<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const busca = ref('')
const historico = ref([])
const carregando = ref(false)

async function buscarHistorico() {
  if (!busca.value) {
    historico.value = []
    return
  }
  carregando.value = true
  try {
    const res = await api.get('/api/lavagens/', {
      params: { busca: busca.value }
    })
    historico.value = res.data.results || res.data
  } catch (e) {
    console.error('Erro ao buscar histórico:', e)
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="veiculos">
    <div class="veiculos__header">
      <h1>Consulta de Veículos e Clientes</h1>
      <p class="veiculos__subtitulo">Pesquise pelo nome do cliente ou placa para ver o histórico</p>
    </div>

    <div class="veiculos__busca">
      <input
        v-model="busca"
        type="text"
        placeholder="Digite o nome do cliente ou a placa..."
        @input="buscarHistorico"
      />
    </div>

    <p v-if="carregando" class="veiculos__status">Buscando...</p>

    <table v-else-if="historico.length" class="veiculos__tabela">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Placa</th>
          <th>Observação</th>
          <th>Último Valor</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in historico" :key="item.id">
          <td><strong>{{ item.cliente_nome }}</strong></td>
          <td>{{ item.placa || '—' }}</td>
          <td>{{ item.observacao || '—' }}</td>
          <td>R$ {{ Number(item.valor).toFixed(2) }}</td>
          <td>{{ new Date(item.horario_entrada).toLocaleDateString('pt-BR') }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else-if="busca" class="veiculos__status">Nenhum registro encontrado para essa busca.</p>
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
}

.veiculos__busca {
  margin-bottom: 1.5rem;
}

.veiculos__busca input {
  width: 100%;
  max-width: 450px;
  padding: 0.65rem 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-card);
  color: var(--text-primary);
}

.veiculos__status {
  color: var(--text-secondary);
}

.veiculos__tabela {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
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
  font-size: 0.8rem;
  text-transform: uppercase;
}
</style>