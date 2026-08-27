<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const funcionarios = ref([])
const baias = ref([])
const carregando = ref(true)
const erro = ref('')
const salvandoFuncionario = ref(false)
const salvandoBaia = ref(false)

const novoFuncionario = ref({
  nome: '',
  tipo_contrato: 'clt',
  salario_base: '',
  data_contratacao: '',
  ativo: true,
})

const novaBaia = ref({
  identificador: '',
  ativa: true,
})

async function carregarDados() {
  const [resFuncionarios, resBaias] = await Promise.all([
    api.get('/api/funcionarios/'),
    api.get('/api/baias/'),
  ])
  funcionarios.value = resFuncionarios.data.results
  baias.value = resBaias.data.results
}

async function cadastrarFuncionario() {
  salvandoFuncionario.value = true
  erro.value = ''
  try {
    await api.post('/api/funcionarios/', novoFuncionario.value)
    novoFuncionario.value = {
      nome: '',
      tipo_contrato: 'clt',
      salario_base: '',
      data_contratacao: '',
      ativo: true,
    }
    await carregarDados()
  } catch (e) {
    erro.value = 'Não foi possível cadastrar o funcionário.'
  } finally {
    salvandoFuncionario.value = false
  }
}

async function cadastrarBaia() {
  salvandoBaia.value = true
  erro.value = ''
  try {
    await api.post('/api/baias/', novaBaia.value)
    novaBaia.value = { identificador: '', ativa: true }
    await carregarDados()
  } catch (e) {
    erro.value = 'Não foi possível cadastrar a baia.'
  } finally {
    salvandoBaia.value = false
  }
}

async function alternarAtivoFuncionario(funcionario) {
  try {
    await api.patch(`/api/funcionarios/${funcionario.id}/`, { ativo: !funcionario.ativo })
    await carregarDados()
  } catch (e) {
    erro.value = 'Não foi possível atualizar o funcionário.'
  }
}

async function alternarAtivaBaia(baia) {
  try {
    await api.patch(`/api/baias/${baia.id}/`, { ativa: !baia.ativa })
    await carregarDados()
  } catch (e) {
    erro.value = 'Não foi possível atualizar a baia.'
  }
}

onMounted(async () => {
  try {
    await carregarDados()
  } catch (e) {
    erro.value = 'Não foi possível carregar os dados.'
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <div class="config">
    <div class="config__header">
      <h1>Configurações</h1>
      <p class="config__subtitulo">Gerencie funcionários e baias</p>
    </div>

    <p v-if="erro" class="config__erro">{{ erro }}</p>
    <p v-if="carregando" class="config__status">Carregando...</p>

    <template v-else>
      <section class="config__secao">
        <h2>Funcionários</h2>

        <form class="config__form" @submit.prevent="cadastrarFuncionario">
          <div class="config__campo">
            <label>Nome</label>
            <input v-model="novoFuncionario.nome" type="text" required />
          </div>
          <div class="config__campo">
            <label>Contrato</label>
            <select v-model="novoFuncionario.tipo_contrato">
              <option value="clt">CLT</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div class="config__campo">
            <label>Salário base</label>
            <input v-model="novoFuncionario.salario_base" type="number" step="0.01" required />
          </div>
          <div class="config__campo">
            <label>Data de contratação</label>
            <input v-model="novoFuncionario.data_contratacao" type="date" required />
          </div>
          <button type="submit" :disabled="salvandoFuncionario">
            {{ salvandoFuncionario ? 'Salvando...' : 'Adicionar funcionário' }}
          </button>
        </form>

        <table class="config__tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Contrato</th>
              <th>Salário base</th>
              <th>Contratado em</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in funcionarios" :key="f.id">
              <td>{{ f.nome }}</td>
              <td>{{ f.tipo_contrato === 'clt' ? 'CLT' : 'Outro' }}</td>
              <td>R$ {{ Number(f.salario_base).toFixed(2) }}</td>
              <td>{{ new Date(f.data_contratacao).toLocaleDateString('pt-BR') }}</td>
              <td>
                <button
                  class="config__badge"
                  :class="f.ativo ? 'config__badge--ativo' : 'config__badge--inativo'"
                  @click="alternarAtivoFuncionario(f)"
                >
                  {{ f.ativo ? 'Ativo' : 'Inativo' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="config__secao">
        <h2>Baias</h2>

        <form class="config__form" @submit.prevent="cadastrarBaia">
          <div class="config__campo">
            <label>Identificador</label>
            <input v-model="novaBaia.identificador" type="text" placeholder="Baia 1" required />
          </div>
          <button type="submit" :disabled="salvandoBaia">
            {{ salvandoBaia ? 'Salvando...' : 'Adicionar baia' }}
          </button>
        </form>

        <table class="config__tabela">
          <thead>
            <tr>
              <th>Identificador</th>
              <th>Ocupada</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in baias" :key="b.id">
              <td>{{ b.identificador }}</td>
              <td>{{ b.ocupada ? 'Sim' : 'Não' }}</td>
              <td>
                <button
                  class="config__badge"
                  :class="b.ativa ? 'config__badge--ativo' : 'config__badge--inativo'"
                  @click="alternarAtivaBaia(b)"
                >
                  {{ b.ativa ? 'Ativa' : 'Inativa' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<style scoped>
.config {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.config__header {
  margin-bottom: 1.5rem;
}

.config__subtitulo {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.config__secao {
  margin-bottom: 2.5rem;
}

.config__secao h2 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.config__form {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1rem;
}

.config__campo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-width: 150px;
}

.config__campo label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.config__campo input,
.config__campo select {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.config__form button[type='submit'] {
  padding: 0.65rem 1.5rem;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.config__form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.config__tabela {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
}

.config__tabela th,
.config__tabela td {
  text-align: left;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.config__tabela th {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.config__tabela tbody tr:last-child td {
  border-bottom: none;
}

.config__badge {
  border: none;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.config__badge--ativo {
  background: rgba(74, 222, 128, 0.15);
  color: var(--success);
}

.config__badge--inativo {
  background: rgba(248, 113, 113, 0.15);
  color: var(--danger);
}

.config__erro {
  color: var(--danger);
  margin-bottom: 1rem;
}

.config__status {
  color: var(--text-secondary);
}
</style>