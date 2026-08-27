<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const rampas = ref([])
const carregando = ref(true)
const erro = ref('')
const salvando = ref(false)

const novaRampa = ref({
  identificador: '',
  ativa: true,
})

async function carregarRampas() {
  const res = await api.get('/api/rampas/')
  rampas.value = res.data.results || res.data
}

async function cadastrarRampa() {
  salvando.value = true
  erro.value = ''
  try {
    await api.post('/api/rampas/', novaRampa.value)
    novaRampa.value = { identificador: '', ativa: true }
    await carregarRampas()
  } catch (e) {
    erro.value = 'Não foi possível cadastrar a rampa.'
  } finally {
    salvando.value = false
  }
}

async function alternarAtiva(rampa) {
  try {
    await api.patch(`/api/rampas/${rampa.id}/`, { ativa: !rampa.ativa })
    await carregarRampas()
  } catch (e) {
    erro.value = 'Não foi possível atualizar a rampa.'
  }
}

onMounted(async () => {
  try {
    await carregarRampas()
  } catch (e) {
    erro.value = 'Não foi possível carregar as rampas.'
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <div class="pagina">
    <div class="pagina__header">
      <h1>Rampas</h1>
      <p class="pagina__subtitulo">Gerencie as rampas disponíveis para lavação</p>
    </div>

    <p v-if="erro" class="pagina__erro">{{ erro }}</p>
    <p v-if="carregando" class="pagina__status">Carregando...</p>

    <template v-else>
      <form class="pagina__form" @submit.prevent="cadastrarRampa">
        <div class="pagina__campo">
          <label>Identificador</label>
          <input v-model="novaRampa.identificador" type="text" placeholder="Ex: Rampa 1" required />
        </div>
        <button type="submit" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Adicionar rampa' }}
        </button>
      </form>

      <table class="pagina__tabela">
        <thead>
          <tr>
            <th>Identificador</th>
            <th>Ocupada</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rampas" :key="r.id">
            <td>{{ r.identificador }}</td>
            <td>{{ r.ocupada ? 'Sim' : 'Não' }}</td>
            <td>
              <button
                class="pagina__badge"
                :class="r.ativa ? 'pagina__badge--ativo' : 'pagina__badge--inativo'"
                @click="alternarAtiva(r)"
              >
                {{ r.ativa ? 'Ativa' : 'Inativa' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
.pagina { max-width: 1100px; margin: 0 auto; padding: 2rem; }
.pagina__header { margin-bottom: 1.5rem; }
.pagina__subtitulo { color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem; }
.pagina__form { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1.25rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; margin-bottom: 1.5rem; }
.pagina__campo { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; min-width: 150px; }
.pagina__campo label { font-size: 0.8rem; color: var(--text-secondary); }
.pagina__campo input { padding: 0.55rem 0.7rem; border: 1px solid var(--border-color); border-radius: var(--radius); background: var(--bg-secondary); color: var(--text-primary); font-size: 0.9rem; }
.pagina__form button[type='submit'] { padding: 0.65rem 1.5rem; background: linear-gradient(135deg, var(--accent), var(--accent-light)); color: #fff; border: none; border-radius: var(--radius); cursor: pointer; font-weight: 600; white-space: nowrap; }
.pagina__tabela { width: 100%; border-collapse: collapse; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius); overflow: hidden; }
.pagina__tabela th, .pagina__tabela td { text-align: left; padding: 0.85rem 1.25rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; }
.pagina__tabela th { color: var(--text-secondary); font-weight: 500; font-size: 0.8rem; text-transform: uppercase; }
.pagina__badge { border: none; padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
.pagina__badge--ativo { background: rgba(74, 222, 128, 0.15); color: var(--success); }
.pagina__badge--inativo { background: rgba(248, 113, 113, 0.15); color: var(--danger); }
.pagina__erro { color: var(--danger); margin-bottom: 1rem; }
.pagina__status { color: var(--text-secondary); }
</style>