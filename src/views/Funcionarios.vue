<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const funcionarios = ref([])
const carregando = ref(true)
const erro = ref('')
const salvando = ref(false)
const excluindo = ref(null)
const editandoId = ref(null)

const novoFuncionario = ref({
  nome: '',
  tipo_contrato: 'clt',
  salario_base: '',
  data_contratacao: '',
})

async function carregarFuncionarios() {
  const res = await api.get('/api/funcionarios/')
  funcionarios.value = res.data.results || res.data
}

function limparFormulario() {
  novoFuncionario.value = {
    nome: '',
    tipo_contrato: 'clt',
    salario_base: '',
    data_contratacao: '',
  }
  editandoId.value = null
}

function iniciarEdicao(funcionario) {
  editandoId.value = funcionario.id
  novoFuncionario.value = {
    nome: funcionario.nome,
    tipo_contrato: funcionario.tipo_contrato,
    salario_base: funcionario.salario_base,
    data_contratacao: funcionario.data_contratacao,
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicao() {
  limparFormulario()
}

async function cadastrarFuncionario() {
  salvando.value = true
  erro.value = ''
  try {
    if (editandoId.value) {
      await api.patch(`/api/funcionarios/${editandoId.value}/`, novoFuncionario.value)
    } else {
      await api.post('/api/funcionarios/', novoFuncionario.value)
    }
    limparFormulario()
    await carregarFuncionarios()
  } catch (e) {
    erro.value = 'Não foi possível salvar o funcionário.'
  } finally {
    salvando.value = false
  }
}

async function excluirFuncionario(funcionario) {
  const confirmou = window.confirm(`Tem certeza que deseja excluir ${funcionario.nome}?`)
  if (!confirmou) return

  excluindo.value = funcionario.id
  try {
    await api.delete(`/api/funcionarios/${funcionario.id}/`)
    if (editandoId.value === funcionario.id) {
      limparFormulario()
    }
    await carregarFuncionarios()
  } catch (e) {
    erro.value = 'Não foi possível excluir esse funcionário.'
  } finally {
    excluindo.value = null
  }
}

onMounted(async () => {
  try {
    await carregarFuncionarios()
  } catch (e) {
    erro.value = 'Não foi possível carregar os funcionários.'
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <div class="pagina">
    <div class="pagina__header">
      <h1>Funcionários</h1>
      <p class="pagina__subtitulo">Gerencie a equipe da lavação</p>
    </div>

    <p v-if="erro" class="pagina__erro">{{ erro }}</p>
    <p v-if="carregando" class="pagina__status">Carregando...</p>

    <template v-else>
      <form class="pagina__form" @submit.prevent="cadastrarFuncionario">
        <div class="pagina__campo">
          <label>Nome</label>
          <input v-model="novoFuncionario.nome" type="text" required />
        </div>
        <div class="pagina__campo">
          <label>Contrato</label>
          <select v-model="novoFuncionario.tipo_contrato">
            <option value="clt">CLT</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div class="pagina__campo">
          <label>Salário base</label>
          <input v-model="novoFuncionario.salario_base" type="number" step="0.01" required />
        </div>
        <div class="pagina__campo">
          <label>Data de contratação</label>
          <input v-model="novoFuncionario.data_contratacao" type="date" required />
        </div>
        <button type="submit" :disabled="salvando">
          {{ salvando ? 'Salvando...' : (editandoId ? 'Salvar edição' : 'Adicionar funcionário') }}
        </button>
        <button v-if="editandoId" type="button" class="pagina__botao-cancelar" @click="cancelarEdicao">
          Cancelar
        </button>
      </form>

      <table class="pagina__tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Contrato</th>
            <th>Salário base</th>
            <th>Contratado em</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in funcionarios" :key="f.id">
            <td>{{ f.nome }}</td>
            <td>{{ f.tipo_contrato === 'clt' ? 'CLT' : 'Outro' }}</td>
            <td>R$ {{ Number(f.salario_base).toFixed(2) }}</td>
            <td>{{ new Date(f.data_contratacao).toLocaleDateString('pt-BR') }}</td>
            <td>
              <div class="pagina__acoes">
                <button class="pagina__botao-editar" @click="iniciarEdicao(f)">
                  Editar
                </button>
                <button
                  class="pagina__botao-excluir"
                  :disabled="excluindo === f.id"
                  @click="excluirFuncionario(f)"
                >
                  {{ excluindo === f.id ? 'Excluindo...' : 'Excluir' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
.pagina {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.pagina__header {
  margin-bottom: 1.5rem;
}

.pagina__subtitulo {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.pagina__form {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;
}

.pagina__campo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-width: 150px;
}

.pagina__campo label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.pagina__campo input,
.pagina__campo select {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.pagina__form button[type='submit'] {
  padding: 0.65rem 1.5rem;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.pagina__botao-cancelar {
  padding: 0.65rem 1.25rem;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.pagina__tabela {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
}

.pagina__tabela th,
.pagina__tabela td {
  text-align: left;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.pagina__tabela th {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.pagina__tabela td:last-child {
  white-space: nowrap;
  text-align: right;
}

.pagina__acoes {
  display: inline-flex;
  gap: 0.4rem;
}

.pagina__botao-editar,
.pagina__botao-excluir {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  white-space: nowrap;
}

.pagina__botao-editar {
  background: var(--bg-secondary);
  color: var(--accent-light);
  border: 1px solid var(--border-color);
}

.pagina__botao-editar:hover {
  border-color: var(--accent-light);
}

.pagina__botao-excluir {
  background: rgba(248, 113, 113, 0.15);
  color: var(--danger);
}

.pagina__botao-excluir:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pagina__erro {
  color: var(--danger);
  margin-bottom: 1rem;
}

.pagina__status {
  color: var(--text-secondary);
}
</style>