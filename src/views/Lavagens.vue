<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const lavagens = ref([])
const rampas = ref([])
const funcionarios = ref([])
const veiculos = ref([])
const carregando = ref(true)
const erro = ref('')
const salvando = ref(false)
const finalizando = ref(null)

const novaLavagem = ref({
  cliente_nome: '',
  placa: '',
  veiculo: '',
  rampa: '',
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

function aoSelecionarVeiculo() {
  const veiculoSel = veiculos.value.find(v => v.id === novaLavagem.value.veiculo)
  if (veiculoSel) {
    novaLavagem.value.placa = veiculoSel.placa
    if (veiculoSel.cliente_nome) {
      novaLavagem.value.cliente_nome = veiculoSel.cliente_nome
    }
  }
}

async function carregarDados() {
  const [resLavagens, resRampas, resFuncionarios, resVeiculos] = await Promise.all([
    api.get('/api/lavagens/'),
    api.get('/api/rampas/'),
    api.get('/api/funcionarios/'),
    api.get('/api/veiculos-cadastro/'),
  ])
  lavagens.value = resLavagens.data.results || resLavagens.data
  rampas.value = resRampas.data.results || resRampas.data
  funcionarios.value = resFuncionarios.data.results || resFuncionarios.data
  veiculos.value = resVeiculos.data.results || resVeiculos.data
}

async function cadastrarLavagem() {
  salvando.value = true
  erro.value = ''

  try {
    await api.post('/api/lavagens/', novaLavagem.value)
    novaLavagem.value = {
      cliente_nome: '',
      placa: '',
      veiculo: '',
      rampa: '',
      funcionario: '',
      forma_pagamento: 'dinheiro',
      valor: '',
      observacao: '',
      horario_entrada: '',
    }
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
      <p class="lavagens__subtitulo">Registro simplificado de lavagens de caminhões</p>
    </div>

    <form class="lavagens__form" @submit.prevent="cadastrarLavagem">
      <div class="lavagens__campo">
        <label>Veículo Registrado</label>
        <select v-model="novaLavagem.veiculo" @change="aoSelecionarVeiculo">
          <option value="">Nenhum (Digitar avulso)</option>
          <option v-for="v in veiculos" :key="v.id" :value="v.id">
            {{ v.placa }} - {{ v.modelo || 'Sem modelo' }}
          </option>
        </select>
      </div>

      <div class="lavagens__campo">
        <label>Nome do Cliente</label>
        <input v-model="novaLavagem.cliente_nome" type="text" placeholder="Ex: Tulio Salvador" required />
      </div>

      <div class="lavagens__campo">
        <label>Placa</label>
        <input v-model="novaLavagem.placa" type="text" placeholder="ABC1D23" />
      </div>

      <div class="lavagens__campo">
        <label>Rampa</label>
        <select v-model="novaLavagem.rampa" required>
          <option value="" disabled>Selecione</option>
          <option v-for="r in rampas" :key="r.id" :value="r.id">{{ r.identificador }}</option>
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
        <label>Pagamento</label>
        <select v-model="novaLavagem.forma_pagamento">
          <option value="dinheiro">Dinheiro</option>
          <option value="pix">Pix</option>
          <option value="cartao">Cartão</option>
        </select>
      </div>

      <div class="lavagens__campo">
        <label>Valor (R$)</label>
        <input v-model="novaLavagem.valor" type="number" step="0.01" placeholder="0.00" required />
      </div>

      <div class="lavagens__campo">
        <label>Observação / Modelo</label>
        <input v-model="novaLavagem.observacao" type="text" placeholder="Ex: FH Vermelho" />
      </div>

      <div class="lavagens__campo">
        <label>Entrada</label>
        <div class="lavagens__campo-linha">
          <input v-model="novaLavagem.horario_entrada" type="datetime-local" required />
          <button type="button" class="lavagens__botao-agora" @click="preencherAgora">Agora</button>
        </div>
      </div>

      <button type="submit" :disabled="salvando">
        {{ salvando ? 'Salvando...' : 'Registrar lavagem' }}
      </button>
    </form>

    <p v-if="erro" class="lavagens__erro">{{ erro }}</p>
    <p v-if="carregando" class="lavagens__status">Carregando...</p>

    <table v-else class="lavagens__tabela">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Placa</th>
          <th>Rampa</th>
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
          <td><strong>{{ l.cliente_nome }}</strong></td>
          <td>{{ l.placa || '—' }}</td>
          <td>{{ l.rampa_nome || '—' }}</td>
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
  min-width: 150px;
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
}
</style>