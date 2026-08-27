<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const veiculos = ref([])
const clientes = ref([])
const busca = ref('')
const carregando = ref(true)
const salvando = ref(false)
const erro = ref('')

const formVeiculo = ref({
  id: null,
  placa: '',
  modelo: '',
  cliente: null
})

async function carregarClientes() {
  const res = await api.get('/api/clientes/')
  clientes.value = res.data.results || res.data
}

async function carregarVeiculos() {
  const res = await api.get('/api/veiculos-cadastro/', {
    params: { busca: busca.value }
  })
  veiculos.value = res.data.results || res.data
}

async function salvarVeiculo() {
  salvando.value = true
  erro.value = ''
  try {
    if (formVeiculo.value.id) {
      await api.put(`/api/veiculos-cadastro/${formVeiculo.value.id}/`, formVeiculo.value)
    } else {
      await api.post('/api/veiculos-cadastro/', formVeiculo.value)
    }
    limparFormulario()
    await carregarVeiculos()
  } catch (e) {
    erro.value = 'Erro ao salvar o veículo. Verifique os dados.'
  } finally {
    salvando.value = false
  }
}

function editarVeiculo(veiculo) {
  formVeiculo.value = {
    id: veiculo.id,
    placa: veiculo.placa,
    modelo: veiculo.modelo || '',
    cliente: veiculo.cliente || null
  }
}

function limparFormulario() {
  formVeiculo.value = { id: null, placa: '', modelo: '', cliente: null }
}

onMounted(async () => {
  try {
    await Promise.all([carregarClientes(), carregarVeiculos()])
  } catch (e) {
    erro.value = 'Erro ao carregar dados de veículos/clientes.'
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <div class="veiculos">
    <div class="veiculos__header">
      <h1>Cadastro de Veículos</h1>
      <p class="veiculos__subtitulo">Gerencie os veículos e a vinculação com os clientes</p>
    </div>

    <!-- Formulário de Cadastro/Edição -->
    <form class="veiculos__form" @submit.prevent="salvarVeiculo">
      <div class="veiculos__campo">
        <label>Placa</label>
        <input v-model="formVeiculo.placa" type="text" placeholder="ABC1D23" required />
      </div>

      <div class="veiculos__campo">
        <label>Modelo</label>
        <input v-model="formVeiculo.modelo" type="text" placeholder="Ex: Scania R450" />
      </div>

      <div class="veiculos__campo">
        <label>Cliente (Proprietário)</label>
        <select v-model="formVeiculo.cliente">
          <option :value="null">Sem cliente vinculado</option>
          <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nome }}</option>
        </select>
      </div>

      <div class="veiculos__acoes-form">
        <button type="submit" :disabled="salvando">
          {{ salvando ? 'Salvando...' : (formVeiculo.id ? 'Atualizar Veículo' : 'Cadastrar Veículo') }}
        </button>
        <button v-if="formVeiculo.id" type="button" class="veiculos__botao-cancelar" @click="limparFormulario">
          Cancelar
        </button>
      </div>
    </form>

    <p v-if="erro" class="veiculos__erro">{{ erro }}</p>

    <!-- Filtro de Busca por Nome do Cliente ou Placa -->
    <div class="veiculos__busca-container">
      <input
        v-model="busca"
        type="text"
        placeholder="Buscar por placa ou nome do cliente..."
        @input="carregarVeiculos"
      />
    </div>

    <p v-if="carregando" class="veiculos__status">Carregando...</p>

    <!-- Tabela de Veículos -->
    <table v-else class="veiculos__tabela">
      <thead>
        <tr>
          <th>Placa</th>
          <th>Modelo</th>
          <th>Cliente</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="v in veiculos" :key="v.id">
          <td><strong>{{ v.placa }}</strong></td>
          <td>{{ v.modelo || '—' }}</td>
          <td>{{ v.cliente_nome || 'Sem proprietário' }}</td>
          <td>
            <button class="veiculos__botao-editar" @click="editarVeiculo(v)">
              Editar
            </button>
          </td>
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

.veiculos__form {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;
}

.veiculos__campo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-width: 180px;
}

.veiculos__campo label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.veiculos__campo input,
.veiculos__campo select {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.veiculos__acoes-form {
  display: flex;
  gap: 0.5rem;
}

.veiculos__form button[type='submit'] {
  padding: 0.65rem 1.5rem;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.veiculos__botao-cancelar {
  padding: 0.65rem 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.85rem;
}

.veiculos__busca-container {
  margin-bottom: 1.5rem;
}

.veiculos__busca-container input {
  width: 100%;
  max-width: 400px;
  padding: 0.65rem 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-card);
  color: var(--text-primary);
}

.veiculos__erro {
  color: var(--danger);
  margin-bottom: 1rem;
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

.veiculos__tabela tbody tr:hover {
  background: var(--bg-secondary);
}

.veiculos__botao-editar {
  padding: 0.4rem 0.9rem;
  background: var(--bg-secondary);
  color: var(--accent-light);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>  