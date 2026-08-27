<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import CardResumo from '../components/CardResumo.vue'
import TabelaFuncionarios from '../components/TabelaFuncionarios.vue'

const carregando = ref(true)
const erro = ref('')

const faturamentoHoje = ref(0)
const lavagensHoje = ref(0)
const rampasOcupadas = ref(0)
const rampasLivres = ref(0)

const faturamentoMes = ref(0)
const lavagensMes = ref(0)

const ranking = ref([])

async function carregarDashboard() {
  const response = await api.get('/api/dashboard/')
  faturamentoHoje.value = response.data.faturamento_hoje
  lavagensHoje.value = response.data.total_lavagens_hoje
  rampasOcupadas.value = response.data.baias_ocupadas || response.data.rampas_ocupadas || 0
  rampasLivres.value = response.data.baias_livres || response.data.rampas_livres || 0
}

async function carregarRelatorioMensal() {
  const response = await api.get('/api/relatorio-mensal/')
  faturamentoMes.value = response.data.faturamento_mes
  lavagensMes.value = response.data.total_lavagens_mes
  ranking.value = response.data.ranking_funcionarios
}

onMounted(async () => {
  try {
    await Promise.all([carregarDashboard(), carregarRelatorioMensal()])
  } catch (e) {
    erro.value = 'Não foi possível carregar os dados do dashboard.'
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <h1>Dashboard</h1>
      <p class="dashboard__subtitulo">Visão geral do seu negócio</p>
    </div>

    <p v-if="carregando" class="dashboard__status">Carregando...</p>
    <p v-else-if="erro" class="dashboard__status dashboard__status--erro">{{ erro }}</p>

    <template v-else>
      <h2 class="dashboard__secao-titulo">Hoje</h2>
      <div class="dashboard__cards">
        <CardResumo titulo="Faturamento hoje" :valor="`R$ ${faturamentoHoje.toFixed(2)}`" />
        <CardResumo titulo="Lavagens hoje" :valor="lavagensHoje" />
        <CardResumo titulo="Rampas ocupadas" :valor="rampasOcupadas" />
        <CardResumo titulo="Rampas livres" :valor="rampasLivres" />
      </div>

      <h2 class="dashboard__secao-titulo">Este mês</h2>
      <div class="dashboard__cards">
        <CardResumo titulo="Faturamento do mês" :valor="`R$ ${faturamentoMes.toFixed(2)}`" />
        <CardResumo titulo="Lavagens no mês" :valor="lavagensMes" />
      </div>

      <h2 class="dashboard__secao-titulo">Ranking de funcionários no mês</h2>
      <TabelaFuncionarios :funcionarios="ranking" />
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard__header {
  margin-bottom: 1.5rem;
}

.dashboard__subtitulo {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.dashboard__cards {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.dashboard__secao-titulo {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.dashboard__status {
  color: var(--text-secondary);
}

.dashboard__status--erro {
  color: var(--danger);
}
</style>