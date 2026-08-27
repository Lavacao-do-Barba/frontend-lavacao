<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const precos = ref([])
const carregando = ref(true)
const erro = ref('')
const salvando = ref(false)

const novoPreco = ref({
  categoria_caminhao: '',
  preco: ''
})

async function carregarPrecos() {
  const res = await api.get('/api/tabela-precos/')
  precos.value = res.data.results || res.data
}

async function salvarPreco() {
  salvando.value = true
  try {
    await api.post('/api/tabela-precos/', novoPreco.value)
    novoPreco.value = { categoria_caminhao: '', preco: '' }
    await carregarPrecos()
  } catch (e) {
    erro.value = 'Erro ao salvar o preço.'
  } finally {
    salvando.value = false
  }
}

async function deletarPreco(id) {
  if (!confirm('Deseja excluir este item?')) return
  try {
    await api.delete(`/api/tabela-precos/${id}/`)
    await carregarPrecos()
  } catch (e) {
    erro.value = 'Erro ao excluir o item.'
  }
}

onMounted(async () => {
  try {
    await carregarPrecos()
  } catch (e) {
    erro.value = 'Erro ao carregar a tabela de preços.'
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <div class="precos">
    <h1>Lista de Preços</h1>
    <p class="subtitulo">Gerenciamento de tabela de valores por veículo</p>

    <form class="form" @submit.prevent="salvarPreco">
      <div class="campo">
        <label>Categoria / Caminhão</label>
        <input v-model="novoPreco.categoria_caminhao" placeholder="Ex: Carreta Sider" required />
      </div>
      <div class="campo">
        <label>Preço (R$)</label>
        <input v-model="novoPreco.preco" type="number" step="0.01" placeholder="350.00" required />
      </div>
      <button type="submit" :disabled="salvando">{{ salvando ? 'Salvando...' : 'Adicionar' }}</button>
    </form>

    <p v-if="erro" class="erro">{{ erro }}</p>
    <p v-if="carregando">Carregando...</p>

    <table v-else class="tabela">
      <thead>
        <tr>
          <th>Categoria / Veículo</th>
          <th>Valor</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in precos" :key="item.id">
          <td><strong>{{ item.categoria_caminhao }}</strong></td>
          <td>R$ {{ Number(item.preco).toFixed(2) }}</td>
          <td>
            <button class="btn-del" @click="deletarPreco(item.id)">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.precos { max-width: 900px; margin: 0 auto; padding: 2rem; }
.subtitulo { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem; }
.form { background: var(--bg-card); padding: 1.5rem; border: 1px solid var(--border-color); border-radius: var(--radius); display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 1.5rem; }
.campo { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; }
.campo label { font-size: 0.8rem; color: var(--text-secondary); }
.campo input { padding: 0.55rem; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); border-radius: var(--radius); }
form button { padding: 0.65rem 1.5rem; background: var(--accent); color: white; border: none; border-radius: var(--radius); cursor: pointer; font-weight: 600; }
.tabela { width: 100%; border-collapse: collapse; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius); }
.tabela th, .tabela td { padding: 0.85rem; border-bottom: 1px solid var(--border-color); text-align: left; }
.btn-del { background: var(--danger); color: white; border: none; padding: 0.3rem 0.6rem; border-radius: var(--radius); cursor: pointer; }
.erro { color: var(--danger); margin-bottom: 1rem; }
</style>