<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../services/api'

const resultados = ref([])
const carregando = ref(true)
const erro = ref('')
const mesSelecionado = ref(new Date().toISOString().slice(0, 7))

async function carregarResultados() {
  carregando.value = true
  erro.value = ''
  try {
    const response = await api.get('/api/resultados-mensais/')
    const [ano, mes] = mesSelecionado.value.split('-')
    resultados.value = response.data.results.filter((r) => {
      const dataRef = new Date(r.mes_referencia)
      return dataRef.getFullYear() === Number(ano) && dataRef.getMonth() + 1 === Number(mes)
    })
  } catch (e) {
    erro.value = 'Não foi possível carregar o relatório.'
  } finally {
    carregando.value = false
  }
}

watch(mesSelecionado, carregarResultados)

onMounted(carregarResultados)
</script>

<template>
  <div class="relatorios">
    <div class="relatorios__header">
      <div>
        <h1>Relatórios</h1>
        <p class="relatorios__subtitulo">Desempenho mensal por funcionário</p>
      </div>
      <input v-model="mesSelecionado" type="month" class="relatorios__filtro-mes" />
    </div>

    <p v-if="erro" class="relatorios__erro">{{ erro }}</p>
    <p v-if="carregando" class="relatorios__status">Carregando...</p>

    <table v-else class="relatorios__tabela">
      <thead>
        <tr>
          <th>Funcionário</th>
          <th>Lavagens</th>
          <th>Metas batidas</th>
          <th>Bônus metas</th>
          <th>Faltas</th>
          <th>Atrasos</th>
          <th>Prêmio presença</th>
          <th>Total adicional</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in resultados" :key="r.id">
          <td>{{ r.funcionario }}</td>
          <td>{{ r.total_lavagens }}</td>
          <td>{{ r.metas_batidas }}</td>
          <td>R$ {{ Number(r.bonus_metas).toFixed(2) }}</td>
          <td>{{ r.total_faltas }}</td>
          <td>{{ r.total_atrasos }}</td>
          <td>R$ {{ Number(r.premio_presenca).toFixed(2) }}</td>
          <td>R$ {{ Number(r.total_adicional).toFixed(2) }}</td>
        </tr>
        <tr v-if="resultados.length === 0">
          <td colspan="8" class="relatorios__vazio">Nenhum resultado nesse mês.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.relatorios {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.relatorios__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;
}

.relatorios__subtitulo {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.relatorios__filtro-mes {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.relatorios__tabela {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
}

.relatorios__tabela th,
.relatorios__tabela td {
  text-align: left;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.relatorios__tabela th {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.relatorios__tabela tbody tr:last-child td {
  border-bottom: none;
}

.relatorios__vazio {
  text-align: center;
  color: var(--text-secondary);
}

.relatorios__erro {
  color: var(--danger);
  margin-bottom: 1rem;
}

.relatorios__status {
  color: var(--text-secondary);
}
</style>