<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const lavagens = ref([])
const baias = ref([])
const funcionarios = ref([])
const carregando = ref(true)
const erro = ref('')
const salvando = ref(false)
const finalizando = ref(null)

// Busca de Veículo/Cliente
const buscaVeiculo = ref('')
const listaVeiculos = ref([])
const focoBusca = ref(false)
const veiculoSelecionado = ref(null)
const historicoValores = ref([])

const novaLavagem = ref({
  veiculo: '',
  baia: '',
  funcionario: '',
  forma_pagamento: 'dinheiro',
  valor: '',
  observacao: '',
  horario_entrada: '',
})

function agoraParaInput() {
  const agora = new Date()
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset())
  return agora.toISOString().slice(0, 16)
}

function preencherAgora() {
  novaLavagem.value.horario_entrada = agoraParaInput()
}

async function carregarDados() {
  const [resLavagens, resBaias, resFuncionarios] = await Promise.all([
    api.get('/api/lavagens/'),
    api.get('/api/baias/'),
    api.get('/api/funcionarios/'),
  ])
  lavagens.value = resLavagens.data.results || resLavagens.data
  baias.value = resBaias.data.results || resBaias.data
  funcionarios.value = resFuncionarios.data.results || resFuncionarios.data
}

async function buscarVeiculos() {
  if (buscaVeiculo.value.length < 2) {
    listaVeiculos.value = []
    focoBusca.value = false
    return
  }
  try {
    const res = await api.get('/api/veiculos-cadastro/', {
      params: { busca: buscaVeiculo.value }
    })
    listaVeiculos.value = res.data.results || res.data
    focoBusca.value = true
  } catch (e) {
    console.error('Erro ao buscar veículos:', e)
  }
}

async function selecionarVeiculo(v) {
  veiculoSelecionado.value = v
  novaLavagem.value.veiculo = v.id
  buscaVeiculo.value = `${v.placa} - ${v.cliente_nome || 'Sem dono'}`
  listaVeiculos.value = []
  focoBusca.value = false

  if (v.cliente) {
    try {
      const res = await api.get('/api/lavagens/', {
        params: { veiculo__cliente: v.cliente }
      })
      const historico = res.data.results || res.data
      historicoValores.value = historico.slice(0, 3).map(i => Number(i.valor).toFixed(2))
    } catch (e) {
      console.error('Erro ao buscar histórico do cliente:', e)
    }
  } else {
    historicoValores.value = []
  }
}

async function cadastrarLavagem() {
  if (!novaLavagem.value.veiculo) {
    erro.value = 'Selecione um veículo válido da lista.'
    return
  }

  salvando.value = true
  erro.value = ''

  try {
    await api.post('/api/lavagens/', novaLavagem.value)
    novaLavagem.value = {
      veiculo: '',
      baia: '',
      funcionario: '',
      forma_pagamento: 'dinheiro',
      valor: '',
      observacao: '',
      horario_entrada: '',
    }
    buscaVeiculo.value = ''
    veiculoSelecionado.value = null
    historicoValores.value = []
    await carregarDados()
  } catch (e) {
    erro.value = 'Não foi possível cadastrar a lavagem. Confira os dados.'
  } finally {
    salvando.value = false
  }
}

async function finalizarLavagem(id) {
  finalizando.value = id
  try {
    await api.patch(`/api/lavagens/${id}/`, {
      horario_saida: new Date().toISOString(),
    })
    await carregarDados()
  } catch (e) {
    erro.value = 'Não foi possível finalizar essa lavagem.'
  } finally {
    finalizando.value = null
  }
}

onMounted(async () => {
  try {
    await carregarDados()
  } catch (e) {
    erro.value = 'Não foi possível carregar as lavagens.'
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <div class="lavagens">
    <div class="lavagens__header">
      <h1>Lavagens</h1>
      <p class="lavagens__subtitulo">Registro de lavagens de caminhões</p>
    </div>

    <form class="lavagens__form" @submit.prevent="cadastrarLavagem">
      <!-- Busca de Veículo / Cliente -->
      <div class="lavagens__campo lavagens__campo--busca">
        <label>Veículo / Cliente (Placa ou Nome)</label>
        <input
          v-model="buscaVeiculo"
          type="text"
          placeholder="Digite a placa ou nome..."
          required
          @input="buscarVeiculos"
          @focus="focoBusca = true"
        />
        <ul v-if="listaVeiculos.length && focoBusca" class="lavagens__dropdown">
          <li v-for="item in listaVeiculos" :key="item.id" @click="selecionarVeiculo(item)">
            <strong>{{ item.placa }}</strong> — {{ item.cliente_nome || 'Sem dono' }} ({{ item.modelo || 'S/ Modelo' }})
          </li>
        </ul>
      </div>

      <!-- Cliente Vinculado (ReadOnly) -->
      <div class="lavagens__campo">
        <label>Cliente</label>
        <input
          type="text"
          :value="veiculoSelecionado ? (veiculoSelecionado.cliente_nome || 'Sem dono') : '—'"
          disabled
        />
      </div>

      <div class="lavagens__campo">
        <label>Baia</label>
        <select v-model="novaLavagem.baia" required>
          <option value="" disabled>Selecione</option>
          <option v-for="b in baias" :key="b.id" :value="b.id">{{ b.identificador }}</option>
        </select>
      </div>

      <div class="lavagens__campo">
        <label>Funcionário</label>
        <select v-model="novaLavagem.funcionario" required>
          <option value="" disabled>Selecione</option>
          <option v-for="f in funcionarios" :key="f.id" :value="f.id">{{ f.nome }}</option>
        </select>
      </div>

      <div class="lavagens__campo">
        <label>Forma de pagamento</label>
        <select v-model="novaLavagem.forma_pagamento">
          <option value="dinheiro">Dinheiro</option>
          <option value="pix">Pix</option>
          <option value="cartao">Cartão</option>
        </select>
      </div>

      <div class="lavagens__campo">
        <label>Valor (R$)</label>
        <input v-model="novaLavagem.valor" type="number" step="0.01" placeholder="0.00" required />
        <span v-if="historicoValores.length" class="lavagens__dica-historico">
          Últimos: {{ historicoValores.map(v => `R$ ${v}`).join(' | ') }}
        </span>
      </div>

      <div class="lavagens__campo">
        <label>Observação / Modelo</label>
        <input v-model="novaLavagem.observacao" type="text" placeholder="Ex: FH 540 Vermelho" />
      </div>

      <div class="lavagens__campo">
        <label>Entrada</label>
        <div class="lavagens__campo-linha">
          <input v-model="novaLavagem.horario_entrada" type="datetime-local" required />
          <button type="button" class="lavagens__botao-agora" @click="preencherAgora">Agora</button>
        </div>
      </div>

      <button type="submit" :disabled="salvando || !novaLavagem.veiculo">
        {{ salvando ? 'Salvando...' : 'Registrar lavagem' }}
      </button>
    </form>

    <p v-if="erro" class="lavagens__erro">{{ erro }}</p>
    <p v-if="carregando" class="lavagens__status">Carregando...</p>

    <table v-else class="lavagens__tabela">
      <thead>
        <tr>
          <th>Placa</th>
          <th>Cliente</th>
          <th>Observação</th>
          <th>Valor</th>
          <th>Pagamento</th>
          <th>Entrada</th>
          <th>Saída</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="l in lavagens" :key="l.id">
          <td><strong>{{ l.placa }}</strong></td>
          <td>{{ l.cliente_nome || '—' }}</td>
          <td>{{ l.observacao || '—' }}</td>
          <td>R$ {{ Number(l.valor).toFixed(2) }}</td>
          <td>{{ l.forma_pagamento }}</td>
          <td>{{ new Date(l.horario_entrada).toLocaleString('pt-BR') }}</td>
          <td>{{ l.horario_saida ? new Date(l.horario_saida).toLocaleString('pt-BR') : '—' }}</td>
          <td>
            <button
              v-if="!l.horario_saida"
              class="lavagens__botao-finalizar"
              :disabled="finalizando === l.id"
              @click="finalizarLavagem(l.id)"
            >
              {{ finalizando === l.id ? 'Finalizando...' : 'Finalizar' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.lavagens {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.lavagens__header {
  margin-bottom: 1.5rem;
}

.lavagens__subtitulo {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.lavagens__form {
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

.lavagens__campo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-width: 160px;
  position: relative;
}

.lavagens__campo--busca {
  min-width: 220px;
}

.lavagens__campo label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.lavagens__campo input,
.lavagens__campo select {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.lavagens__campo input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.lavagens__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  max-height: 180px;
  overflow-y: auto;
  z-index: 10;
  list-style: none;
  padding: 0;
  margin: 0.2rem 0 0 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.lavagens__dropdown li {
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--border-color);
}

.lavagens__dropdown li:last-child {
  border-bottom: none;
}

.lavagens__dropdown li:hover {
  background: var(--bg-secondary);
}

.lavagens__dica-historico {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.lavagens__campo-linha {
  display: flex;
  gap: 0;
}

.lavagens__form .lavagens__campo-linha input {
  flex: 1;
  min-width: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.lavagens__botao-agora {
  padding: 0 0.9rem;
  background: var(--bg-secondary);
  color: var(--accent-light);
  border: 1px solid var(--border-color);
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.2s ease;
}

.lavagens__botao-agora:hover {
  background: var(--accent);
  color: #fff;
}

.lavagens__form button[type='submit'] {
  padding: 0.65rem 1.5rem;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.lavagens__form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.lavagens__erro {
  color: var(--danger);
  margin-bottom: 1rem;
}

.lavagens__status {
  color: var(--text-secondary);
}

.lavagens__tabela {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
}

.lavagens__tabela th,
.lavagens__tabela td {
  text-align: left;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.lavagens__tabela th {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.lavagens__tabela tbody tr:last-child td {
  border-bottom: none;
}

.lavagens__tabela tbody tr:hover {
  background: var(--bg-secondary);
}

.lavagens__botao-finalizar {
  padding: 0.4rem 0.9rem;
  background: var(--success);
  color: #0f1729;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.lavagens__botao-finalizar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>