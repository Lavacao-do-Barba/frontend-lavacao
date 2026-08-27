<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'

const registros = ref([])
const funcionarios = ref([])
const carregando = ref(true)
const erro = ref('')
const salvando = ref(false)
const excluindo = ref(null)

const STATUS_LABEL = {
  presente: 'Presente',
  atraso: 'Atraso',
  falta: 'Falta',
}

function hojeParaInput() {
  const agora = new Date()
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset())
  return agora.toISOString().slice(0, 10)
}

const novoRegistro = ref({
  funcionario: '',
  data: hojeParaInput(),
  status: 'presente',
  horario_chegada: '',
})

// horário de chegada só faz sentido quando o funcionário compareceu
const mostrarHorario = computed(
  () => novoRegistro.value.status === 'presente' || novoRegistro.value.status === 'atraso'
)

// filtro simples por mês, pra não carregar a tabela toda de uma vez
const mesFiltro = ref(hojeParaInput().slice(0, 7)) // YYYY-MM

const registrosFiltrados = computed(() =>
  registros.value.filter((r) => r.data.slice(0, 7) === mesFiltro.value)
)

async function carregarDados() {
  const [resRegistros, resFuncionarios] = await Promise.all([
    api.get('/api/presencas/'),
    api.get('/api/funcionarios/'),
  ])
  registros.value = resRegistros.data.results
  funcionarios.value = resFuncionarios.data.results
}

function nomeFuncionario(id) {
  return funcionarios.value.find((f) => f.id === id)?.nome ?? '—'
}

async function registrarPresenca() {
  salvando.value = true
  erro.value = ''

  const payload = { ...novoRegistro.value }
  if (!mostrarHorario.value) {
    payload.horario_chegada = null
  }

  try {
    await api.post('/api/presencas/', payload)
    novoRegistro.value = {
      funcionario: '',
      data: hojeParaInput(),
      status: 'presente',
      horario_chegada: '',
    }
    await carregarDados()
  } catch (e) {
    // unique_together (funcionario, data) no backend costuma cair aqui
    if (e.response?.status === 400) {
      erro.value = 'Já existe um registro para esse funcionário nessa data.'
    } else {
      erro.value = 'Não foi possível registrar. Confira os dados.'
    }
  } finally {
    salvando.value = false
  }
}

async function excluirRegistro(id) {
  excluindo.value = id
  try {
    await api.delete(`/api/presencas/${id}/`)
    await carregarDados()
  } catch (e) {
    erro.value = 'Não foi possível excluir esse registro.'
  } finally {
    excluindo.value = null
  }
}

onMounted(async () => {
  try {
    await carregarDados()
  } catch (e) {
    erro.value = 'Não foi possível carregar os registros de presença.'
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <div class="presenca">
    <div class="presenca__header">
      <h1>Presença</h1>
      <p class="presenca__subtitulo">Registro de presença, falta e atraso dos funcionários</p>
    </div>

    <form class="presenca__form" @submit.prevent="registrarPresenca">
      <div class="presenca__campo">
        <label>Funcionário</label>
        <select v-model="novoRegistro.funcionario" required>
          <option value="" disabled>Selecione</option>
          <option v-for="f in funcionarios" :key="f.id" :value="f.id">{{ f.nome }}</option>
        </select>
      </div>

      <div class="presenca__campo">
        <label>Data</label>
        <input v-model="novoRegistro.data" type="date" required />
      </div>

      <div class="presenca__campo">
        <label>Status</label>
        <select v-model="novoRegistro.status">
          <option value="presente">Presente</option>
          <option value="atraso">Atraso</option>
          <option value="falta">Falta</option>
        </select>
      </div>

      <div class="presenca__campo" v-if="mostrarHorario">
        <label>Horário de chegada</label>
        <input v-model="novoRegistro.horario_chegada" type="time" />
      </div>

      <button type="submit" :disabled="salvando">
        {{ salvando ? 'Salvando...' : 'Registrar' }}
      </button>
    </form>

    <p v-if="erro" class="presenca__erro">{{ erro }}</p>

    <div class="presenca__filtro">
      <label>Mês</label>
      <input v-model="mesFiltro" type="month" />
    </div>

    <p v-if="carregando" class="presenca__status">Carregando...</p>

    <table v-else class="presenca__tabela">
      <thead>
        <tr>
          <th>Funcionário</th>
          <th>Data</th>
          <th>Status</th>
          <th>Chegada</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in registrosFiltrados" :key="r.id">
          <td>{{ nomeFuncionario(r.funcionario) }}</td>
          <td>{{ new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR') }}</td>
          <td>
            <span class="presenca__badge" :class="`presenca__badge--${r.status}`">
              {{ STATUS_LABEL[r.status] ?? r.status }}
            </span>
          </td>
          <td>{{ r.horario_chegada ?? '—' }}</td>
          <td>
            <button
              class="presenca__botao-excluir"
              :disabled="excluindo === r.id"
              @click="excluirRegistro(r.id)"
            >
              {{ excluindo === r.id ? 'Excluindo...' : 'Excluir' }}
            </button>
          </td>
        </tr>
        <tr v-if="registrosFiltrados.length === 0">
          <td colspan="5" class="presenca__vazio">Nenhum registro nesse mês.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.presenca {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.presenca__header {
  margin-bottom: 1.5rem;
}

.presenca__subtitulo {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.presenca__form {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1rem;
}

.presenca__campo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-width: 150px;
}

.presenca__campo label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.presenca__campo input,
.presenca__campo select {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.presenca__form button[type='submit'] {
  padding: 0.65rem 1.5rem;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.presenca__form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.presenca__erro {
  color: var(--danger);
  margin-bottom: 1rem;
}

.presenca__filtro {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.presenca__filtro label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.presenca__filtro input {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.presenca__status {
  color: var(--text-secondary);
}

.presenca__tabela {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
}

.presenca__tabela th,
.presenca__tabela td {
  text-align: left;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.presenca__tabela th {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.presenca__tabela tbody tr:last-child td {
  border-bottom: none;
}

.presenca__tabela tbody tr:hover {
  background: var(--bg-secondary);
}

.presenca__vazio {
  text-align: center;
  color: var(--text-secondary);
  padding: 1.5rem;
}

.presenca__badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.presenca__badge--presente {
  background: rgba(46, 204, 113, 0.15);
  color: var(--success);
}

.presenca__badge--atraso {
  background: rgba(241, 196, 15, 0.15);
  color: #f1c40f;
}

.presenca__badge--falta {
  background: rgba(231, 76, 60, 0.15);
  color: var(--danger);
}

.presenca__botao-excluir {
  padding: 0.4rem 0.9rem;
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.presenca__botao-excluir:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>