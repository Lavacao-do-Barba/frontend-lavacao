<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'

const lavagens = ref([])
const rampas = ref([])
const funcionarios = ref([])
const veiculos = ref([])
const clientes = ref([])
const carregando = ref(true)
const erro = ref('')
const salvando = ref(false)
const finalizando = ref(null)
const excluindo = ref(null)
const editandoId = ref(null)
const editandoLavagemOriginal = ref(null)

const novaLavagem = ref({
  cliente: null,
  cliente_nome: '',
  placa: '',
  veiculo: null,
  rampa: '',
  funcionario: '',
  forma_pagamento: 'dinheiro',
  valor: '',
  observacao: '',
  horario_entrada: '',
})

const rampasOcupadasIds = computed(() => {
  return lavagens.value
    .filter(l => !l.horario_saida && l.id !== editandoId.value)
    .map(l => String(l.rampa))
})

const funcionariosOcupadosIds = computed(() => {
  return lavagens.value
    .filter(l => !l.horario_saida && l.id !== editandoId.value)
    .map(l => String(l.funcionario))
})

function agoraParaInput() {
  const agora = new Date()
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset())
  return agora.toISOString().slice(0, 16)
}

function isoParaInput(iso) {
  const data = new Date(iso)
  data.setMinutes(data.getMinutes() - data.getTimezoneOffset())
  return data.toISOString().slice(0, 16)
}

function preencherAgora() {
  novaLavagem.value.horario_entrada = agoraParaInput()
}

function aoSelecionarCliente() {
  const clienteSel = clientes.value.find(c => c.id === novaLavagem.value.cliente)
  if (clienteSel) {
    novaLavagem.value.cliente_nome = clienteSel.nome
  }
}

function aoSelecionarVeiculo() {
  if (!novaLavagem.value.veiculo) return
  const veiculoSel = veiculos.value.find(v => v.id === novaLavagem.value.veiculo)
  if (veiculoSel) {
    novaLavagem.value.placa = veiculoSel.placa
    if (veiculoSel.cliente) {
      novaLavagem.value.cliente = veiculoSel.cliente
    }
    if (veiculoSel.cliente_nome) {
      novaLavagem.value.cliente_nome = veiculoSel.cliente_nome
    }
  }
}

function limparFormulario() {
  novaLavagem.value = {
    cliente: null,
    cliente_nome: '',
    placa: '',
    veiculo: null,
    rampa: '',
    funcionario: '',
    forma_pagamento: 'dinheiro',
    valor: '',
    observacao: '',
    horario_entrada: '',
  }
  editandoId.value = null
  editandoLavagemOriginal.value = null
}

function iniciarEdicao(lavagem) {
  editandoId.value = lavagem.id
  editandoLavagemOriginal.value = { ...lavagem }
  novaLavagem.value = {
    cliente: lavagem.cliente || null,
    cliente_nome: lavagem.cliente_nome || '',
    placa: lavagem.placa || '',
    veiculo: lavagem.veiculo || null,
    rampa: lavagem.rampa,
    funcionario: lavagem.funcionario,
    forma_pagamento: lavagem.forma_pagamento,
    valor: lavagem.valor,
    observacao: lavagem.observacao || '',
    horario_entrada: isoParaInput(lavagem.horario_entrada),
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicao() {
  limparFormulario()
}

async function carregarDados() {
  const [resLavagens, resRampas, resFuncionarios, resVeiculos, resClientes] = await Promise.all([
    api.get('/api/lavagens/'),
    api.get('/api/rampas/'),
    api.get('/api/funcionarios/'),
    api.get('/api/veiculos-cadastro/'),
    api.get('/api/clientes/'),
  ])
  lavagens.value = resLavagens.data.results || resLavagens.data
  rampas.value = resRampas.data.results || resRampas.data
  funcionarios.value = resFuncionarios.data.results || resFuncionarios.data
  veiculos.value = resVeiculos.data.results || resVeiculos.data
  clientes.value = resClientes.data.results || resClientes.data
}

async function cadastrarLavagem() {
  salvando.value = true
  erro.value = ''

  if (rampasOcupadasIds.value.includes(String(novaLavagem.value.rampa))) {
    erro.value = 'Esta rampa já está em uso por outra lavagem em andamento.'
    salvando.value = false
    return
  }

  if (funcionariosOcupadosIds.value.includes(String(novaLavagem.value.funcionario))) {
    erro.value = 'Este funcionário já está alocado em uma lavagem em andamento.'
    salvando.value = false
    return
  }

  try {
    let entradaIso = novaLavagem.value.horario_entrada
    if (entradaIso && !entradaIso.includes('Z') && entradaIso.length === 16) {
      entradaIso = new Date(entradaIso).toISOString()
    }

    const rampaSel = rampas.value.find(r => r.id === novaLavagem.value.rampa)
    const funcSel = funcionarios.value.find(f => f.id === novaLavagem.value.funcionario)
    const unidadeId = rampaSel?.unidade || funcSel?.unidade || null

    const payload = {
      ...novaLavagem.value,
      horario_entrada: entradaIso,
      veiculo: novaLavagem.value.veiculo || null,
      cliente: novaLavagem.value.cliente || null
    }

    if (unidadeId) {
      payload.unidade = unidadeId
    }

    if (editandoId.value) {
      await api.patch(`/api/lavagens/${editandoId.value}/`, payload)

      const rampaAntiga = editandoLavagemOriginal.value.rampa
      const rampaNova = novaLavagem.value.rampa
      const aindaEmAndamento = !editandoLavagemOriginal.value.horario_saida

      if (aindaEmAndamento && String(rampaAntiga) !== String(rampaNova)) {
        try {
          await api.patch(`/api/rampas/${rampaAntiga}/`, { ocupada: false })
        } catch (e) {}
        try {
          await api.patch(`/api/rampas/${rampaNova}/`, { ocupada: true })
        } catch (e) {}
      }
    } else {
      await api.post('/api/lavagens/', payload)

      if (novaLavagem.value.rampa) {
        try {
          await api.patch(`/api/rampas/${novaLavagem.value.rampa}/`, { ocupada: true })
        } catch (e) {}
      }
    }

    limparFormulario()
    await carregarDados()
  } catch (e) {
    erro.value = e.response?.data ? JSON.stringify(e.response.data) : 'Não foi possível salvar a lavagem. Confira os dados.'
  } finally {
    salvando.value = false
  }
}

async function finalizarLavagem(id, rampaId) {
  finalizando.value = id
  try {
    await api.patch(`/api/lavagens/${id}/`, {
      horario_saida: new Date().toISOString(),
    })

    if (rampaId) {
      try {
        await api.patch(`/api/rampas/${rampaId}/`, { ocupada: false })
      } catch (e) {}
    }

    await carregarDados()
  } catch (e) {
    erro.value = 'Não foi possível finalizar essa lavagem.'
  } finally {
    finalizando.value = null
  }
}

async function excluirLavagem(lavagem) {
  const confirmou = window.confirm(
    `Tem certeza que deseja excluir a lavagem de ${lavagem.cliente_nome} (${lavagem.placa || 'sem placa'})?`
  )
  if (!confirmou) return

  excluindo.value = lavagem.id
  try {
    await api.delete(`/api/lavagens/${lavagem.id}/`)

    if (!lavagem.horario_saida && lavagem.rampa) {
      try {
        await api.patch(`/api/rampas/${lavagem.rampa}/`, { ocupada: false })
      } catch (e) {}
    }

    if (editandoId.value === lavagem.id) {
      limparFormulario()
    }

    await carregarDados()
  } catch (e) {
    erro.value = 'Não foi possível excluir essa lavagem.'
  } finally {
    excluindo.value = null
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
          <option :value="null">Nenhum (Digitar avulso)</option>
          <option v-for="v in veiculos" :key="v.id" :value="v.id">
            {{ v.placa }} - {{ v.modelo || 'Sem modelo' }}
          </option>
        </select>
      </div>

      <div class="lavagens__campo">
        <label>Cliente Cadastrado</label>
        <select v-model="novaLavagem.cliente" @change="aoSelecionarCliente">
          <option :value="null">Nenhum (Digitar nome abaixo)</option>
          <option v-for="c in clientes" :key="c.id" :value="c.id">
            {{ c.nome }} {{ c.cpf_cnpj ? `(${c.cpf_cnpj})` : '' }}
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
          <option
            v-for="r in rampas"
            :key="r.id"
            :value="r.id"
            :disabled="rampasOcupadasIds.includes(String(r.id))"
          >
            {{ r.identificador }} {{ rampasOcupadasIds.includes(String(r.id)) ? '(Ocupada)' : '' }}
          </option>
        </select>
      </div>

      <div class="lavagens__campo">
        <label>Funcionário</label>
        <select v-model="novaLavagem.funcionario" required>
          <option value="" disabled>Selecione</option>
          <option
            v-for="f in funcionarios"
            :key="f.id"
            :value="f.id"
            :disabled="funcionariosOcupadosIds.includes(String(f.id))"
          >
            {{ f.nome }} {{ funcionariosOcupadosIds.includes(String(f.id)) ? '(Ocupado)' : '' }}
          </option>
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
        {{ salvando ? 'Salvando...' : (editandoId ? 'Salvar edição' : 'Registrar lavagem') }}
      </button>

      <button v-if="editandoId" type="button" class="lavagens__botao-cancelar" @click="cancelarEdicao">
        Cancelar
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
          <td class="lavagens__acoes">
            <button
              v-if="!l.horario_saida"
              class="lavagens__botao-finalizar"
              :disabled="finalizando === l.id"
              @click="finalizarLavagem(l.id, l.rampa)"
            >
              {{ finalizando === l.id ? 'Finalizando...' : 'Finalizar' }}
            </button>
            <button class="lavagens__botao-editar" @click="iniciarEdicao(l)">
              Editar
            </button>
            <button
              class="lavagens__botao-excluir"
              :disabled="excluindo === l.id"
              @click="excluirLavagem(l)"
            >
              {{ excluindo === l.id ? 'Excluindo...' : 'Excluir' }}
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

.lavagens__campo select option:disabled {
  color: var(--text-secondary);
  opacity: 0.5;
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

.lavagens__botao-cancelar {
  padding: 0.65rem 1.25rem;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
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

.lavagens__acoes {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
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

.lavagens__botao-editar {
  padding: 0.4rem 0.9rem;
  background: var(--bg-secondary);
  color: var(--accent-light);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
}

.lavagens__botao-editar:hover {
  border-color: var(--accent-light);
}

.lavagens__botao-excluir {
  padding: 0.4rem 0.9rem;
  background: rgba(248, 113, 113, 0.15);
  color: var(--danger);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
}

.lavagens__botao-excluir:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>