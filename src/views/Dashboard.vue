<script setup>
import { ref } from 'vue'
import CardResumo from '../components/CardResumo.vue'
import TabelaFuncionarios from '../components/TabelaFuncionarios.vue'

// TODO: substituir por chamada real à API quando integrarmos com o backend
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

    <div class="dashboard__cards">
      <CardResumo titulo="Funcionários" :valor="totalFuncionarios" />
      <CardResumo titulo="Lavagens no mês" :valor="lavagensDoMes" />
      <CardResumo titulo="Faltas no mês" :valor="faltasDoMes" />
      <CardResumo titulo="Atrasos no mês" :valor="atrasosDoMes" />
    </div>

    <h2>Resumo por funcionário</h2>
    <TabelaFuncionarios :funcionarios="funcionarios" />
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.dashboard__cards {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
</style>