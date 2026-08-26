<script setup>
import { ref } from 'vue'
import CardResumo from '../components/CardResumo.vue'
import TabelaFuncionarios from '../components/TabelaFuncionarios.vue'

// TODO: substituir por chamada real à API na próxima issue
const totalFuncionarios = ref(8)
const lavagensDoMes = ref(142)
const faltasDoMes = ref(3)
const atrasosDoMes = ref(5)

const funcionarios = ref([
  { nome: 'João Silva', lavagens: 24, faltas: 1, atrasos: 0 },
  { nome: 'Maria Souza', lavagens: 31, faltas: 0, atrasos: 2 },
  { nome: 'Pedro Lima', lavagens: 18, faltas: 2, atrasos: 1 },
])
</script>

<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <h1>Dashboard</h1>
      <p class="dashboard__subtitulo">Visão geral do seu negócio</p>
    </div>

    <div class="dashboard__cards">
      <CardResumo titulo="Funcionários" :valor="totalFuncionarios" />
      <CardResumo titulo="Lavagens no mês" :valor="lavagensDoMes" variacao="▲ atualizado hoje" />
      <CardResumo titulo="Faltas no mês" :valor="faltasDoMes" />
      <CardResumo titulo="Atrasos no mês" :valor="atrasosDoMes" />
    </div>

    <h2 class="dashboard__secao-titulo">Resumo por funcionário</h2>
    <TabelaFuncionarios :funcionarios="funcionarios" />
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
</style>