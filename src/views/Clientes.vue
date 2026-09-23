<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const clientes = ref([])
const veiculos = ref([])
const carregando = ref(true)
const salvando = ref(false)
const erro = ref('')
const filtro = ref('')

const clienteSelecionado = ref(null)
const historico = ref([])
const carregandoDetalhes = ref(false)

const editando = ref(false)
const clienteEmEdicao = ref(null)
const salvandoEdicao = ref(false)

const novoVeiculoDetalhe = ref({ placa: '', modelo: '' })
const salvandoVeiculoDetalhe = ref(false)

const veiculoEditandoId = ref(null)
const veiculoEmEdicao = ref({ placa: '', modelo: '' })
const salvandoVeiculoEdicao = ref(false)
const excluindoVeiculoId = ref(null)

const cliente = ref({
  codigo_pessoa: '',
  nome: '',
  nome_fantasia: '',
  natureza: 'Juridica',
  cpf_cnpj: '',
  ie_rg: '',
  ie_st: '',
  im: '',
  emissao_rg: '',
  suframa: '',
  cep: '',
  logradouro: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  caixa_postal: '',
  ramal: '',
  telefone: '',
  celular: '',
  email: '',
  contato: '',
  distancia: 0,
  cadastro_ativo: true,
  pe: false,
  grupo: '',
  centro_custo: '',
  seg_fornec: '',
  emp_origem: '',
  taf: '',
  nre: ''
})

const veiculosNovoCliente = ref([{ placa: '', modelo: '' }])

function adicionarLinhaVeiculo() {
  veiculosNovoCliente.value.push({ placa: '', modelo: '' })
}

function removerLinhaVeiculo(index) {
  veiculosNovoCliente.value.splice(index, 1)
}

const clientesFiltrados = computed(() => {
  if (!filtro.value) return clientes.value
  const termo = filtro.value.toLowerCase()
  return clientes.value.filter(c =>
    (c.nome || '').toLowerCase().includes(termo) ||
    (c.cpf_cnpj || '').toLowerCase().includes(termo) ||
    (c.telefone || '').toLowerCase().includes(termo)
  )
})

const veiculosDoCliente = computed(() => {
  if (!clienteSelecionado.value) return []
  return veiculos.value.filter(v => v.cliente === clienteSelecionado.value.id)
})

async function carregarClientes() {
  const res = await api.get('/api/clientes/')
  clientes.value = res.data.results || res.data
}

async function carregarVeiculos() {
  const res = await api.get('/api/veiculos-cadastro/')
  veiculos.value = res.data.results || res.data
}

async function cadastrarCliente() {
  salvando.value = true
  erro.value = ''
  try {
    const resCliente = await api.post('/api/clientes/', cliente.value)
    const novoClienteId = resCliente.data.id

    const veiculosValidos = veiculosNovoCliente.value.filter(v => v.placa.trim() !== '')
    for (const v of veiculosValidos) {
      try {
        await api.post('/api/veiculos-cadastro/', {
          placa: v.placa,
          modelo: v.modelo,
          cliente: novoClienteId,
        })
      } catch (e) {
        erro.value = `Cliente salvo, mas não foi possível cadastrar o veículo ${v.placa}. Confira se a placa já existe.`
      }
    }

    alert('Cliente salvo com sucesso!')
    veiculosNovoCliente.value = [{ placa: '', modelo: '' }]
    await Promise.all([carregarClientes(), carregarVeiculos()])
  } catch (e) {
    erro.value = 'Erro ao cadastrar cliente.'
  } finally {
    salvando.value = false
  }
}

async function verDetalhes(c) {
  clienteSelecionado.value = c
  editando.value = false
  veiculoEditandoId.value = null
  carregandoDetalhes.value = true
  historico.value = []
  novoVeiculoDetalhe.value = { placa: '', modelo: '' }
  try {
    const [resHistorico] = await Promise.all([
      api.get('/api/lavagens/', { params: { cliente: c.id } }),
      veiculos.value.length ? Promise.resolve(null) : carregarVeiculos(),
    ])
    historico.value = resHistorico.data.results || resHistorico.data
  } catch (e) {
    erro.value = 'Não foi possível carregar os detalhes desse cliente.'
  } finally {
    carregandoDetalhes.value = false
  }
}

function fecharDetalhes() {
  clienteSelecionado.value = null
  editando.value = false
  veiculoEditandoId.value = null
  historico.value = []
}

function iniciarEdicao() {
  clienteEmEdicao.value = { ...clienteSelecionado.value }
  editando.value = true
}

function cancelarEdicao() {
  editando.value = false
  clienteEmEdicao.value = null
}

async function salvarEdicao() {
  salvandoEdicao.value = true
  erro.value = ''
  try {
    const res = await api.patch(`/api/clientes/${clienteSelecionado.value.id}/`, clienteEmEdicao.value)
    clienteSelecionado.value = res.data
    const idx = clientes.value.findIndex(c => c.id === res.data.id)
    if (idx !== -1) clientes.value[idx] = res.data
    editando.value = false
  } catch (e) {
    erro.value = 'Não foi possível salvar as alterações. Confira os dados.'
  } finally {
    salvandoEdicao.value = false
  }
}

async function adicionarVeiculoDetalhe() {
  if (!novoVeiculoDetalhe.value.placa.trim()) return
  salvandoVeiculoDetalhe.value = true
  try {
    const res = await api.post('/api/veiculos-cadastro/', {
      placa: novoVeiculoDetalhe.value.placa,
      modelo: novoVeiculoDetalhe.value.modelo,
      cliente: clienteSelecionado.value.id,
    })
    veiculos.value.push(res.data)
    novoVeiculoDetalhe.value = { placa: '', modelo: '' }
  } catch (e) {
    erro.value = 'Não foi possível cadastrar esse veículo. Confira se a placa já existe.'
  } finally {
    salvandoVeiculoDetalhe.value = false
  }
}

function iniciarEdicaoVeiculo(v) {
  veiculoEditandoId.value = v.id
  veiculoEmEdicao.value = { placa: v.placa, modelo: v.modelo || '' }
}

function cancelarEdicaoVeiculo() {
  veiculoEditandoId.value = null
}

async function salvarEdicaoVeiculo(id) {
  salvandoVeiculoEdicao.value = true
  try {
    const res = await api.patch(`/api/veiculos-cadastro/${id}/`, veiculoEmEdicao.value)
    const idx = veiculos.value.findIndex(v => v.id === id)
    if (idx !== -1) veiculos.value[idx] = res.data
    veiculoEditandoId.value = null
  } catch (e) {
    erro.value = 'Não foi possível salvar o veículo. Confira se a placa já existe.'
  } finally {
    salvandoVeiculoEdicao.value = false
  }
}

async function excluirVeiculo(id) {
  if (!confirm('Excluir esse veículo? Essa ação não pode ser desfeita.')) return
  excluindoVeiculoId.value = id
  try {
    await api.delete(`/api/veiculos-cadastro/${id}/`)
    veiculos.value = veiculos.value.filter(v => v.id !== id)
  } catch (e) {
    erro.value = 'Não foi possível excluir esse veículo.'
  } finally {
    excluindoVeiculoId.value = null
  }
}

onMounted(async () => {
  try {
    await carregarClientes()
  } catch (e) {
    erro.value = 'Erro ao carregar dados.'
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <div class="cliente-container">
    <h1>Clientes</h1>

    <section class="section">
      <div class="lista-header">
        <legend>Clientes Cadastrados</legend>
        <input v-model="filtro" placeholder="Buscar por nome, CPF/CNPJ ou telefone" class="input-busca" />
      </div>

      <p v-if="carregando" class="status">Carregando...</p>

      <table v-else class="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF/CNPJ</th>
            <th>Cidade</th>
            <th>Telefone</th>
            <th>Ativo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in clientesFiltrados" :key="c.id">
            <td><strong>{{ c.nome }}</strong></td>
            <td>{{ c.cpf_cnpj || '—' }}</td>
            <td>{{ c.cidade || '—' }}</td>
            <td>{{ c.telefone || c.celular || '—' }}</td>
            <td>{{ c.cadastro_ativo ? 'Sim' : 'Não' }}</td>
            <td>
              <button class="btn-historico" @click="verDetalhes(c)">Ver detalhes</button>
            </td>
          </tr>
          <tr v-if="clientesFiltrados.length === 0">
            <td colspan="6" class="status">Nenhum cliente encontrado.</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="clienteSelecionado" class="section">
      <div class="lista-header">
        <legend>Detalhes de {{ clienteSelecionado.nome }}</legend>
        <div class="header-botoes">
          <button v-if="!editando" class="btn-historico" @click="iniciarEdicao">Editar</button>
          <button class="btn-fechar" @click="fecharDetalhes">Fechar</button>
        </div>
      </div>

      <p v-if="carregandoDetalhes" class="status">Carregando...</p>

      <template v-else-if="editando">
        <div class="form-grid">
          <div class="field-group span-2">
            <label>Nome do Cliente:</label>
            <input v-model="clienteEmEdicao.nome" autocomplete="off" />
          </div>
          <div class="field-group span-2">
            <label>Nome Fantasia:</label>
            <input v-model="clienteEmEdicao.nome_fantasia" autocomplete="off" />
          </div>
          <div class="field-group">
            <label>CPF ou CNPJ:</label>
            <input v-model="clienteEmEdicao.cpf_cnpj" autocomplete="off" />
          </div>
          <div class="field-group">
            <label>RG ou Inscrição Estadual:</label>
            <input v-model="clienteEmEdicao.ie_rg" autocomplete="off" />
          </div>
          <div class="field-group">
            <label>CEP:</label>
            <input v-model="clienteEmEdicao.cep" autocomplete="off" />
          </div>
          <div class="field-group span-2">
            <label>Rua / Avenida:</label>
            <input v-model="clienteEmEdicao.logradouro" autocomplete="off" />
          </div>
          <div class="field-group">
            <label>Bairro:</label>
            <input v-model="clienteEmEdicao.bairro" autocomplete="off" />
          </div>
          <div class="field-group">
            <label>Cidade:</label>
            <input v-model="clienteEmEdicao.cidade" autocomplete="off" />
          </div>
          <div class="field-group">
            <label>Estado (sigla):</label>
            <input v-model="clienteEmEdicao.uf" maxlength="2" class="short" autocomplete="off" style="text-transform: uppercase" />
          </div>
          <div class="field-group">
            <label>Telefone:</label>
            <input v-model="clienteEmEdicao.telefone" autocomplete="off" />
          </div>
          <div class="field-group">
            <label>Celular:</label>
            <input v-model="clienteEmEdicao.celular" autocomplete="off" />
          </div>
          <div class="field-group span-2">
            <label>Email:</label>
            <input v-model="clienteEmEdicao.email" type="email" autocomplete="off" />
          </div>
          <div class="field-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="clienteEmEdicao.cadastro_ativo" /> Cliente Ativo
            </label>
          </div>
        </div>

        <div class="edicao-botoes">
          <button class="btn-fechar" @click="cancelarEdicao" :disabled="salvandoEdicao">Cancelar</button>
          <button class="btn-save" @click="salvarEdicao" :disabled="salvandoEdicao">
            {{ salvandoEdicao ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </template>

      <template v-else>
        <div class="detalhes-grid">
          <div><span class="detalhes-label">Nome Fantasia</span>{{ clienteSelecionado.nome_fantasia || '—' }}</div>
          <div><span class="detalhes-label">CPF/CNPJ</span>{{ clienteSelecionado.cpf_cnpj || '—' }}</div>
          <div><span class="detalhes-label">RG/IE</span>{{ clienteSelecionado.ie_rg || '—' }}</div>
          <div><span class="detalhes-label">Tipo</span>{{ clienteSelecionado.natureza === 'Fisica' ? 'Pessoa Física' : 'Pessoa Jurídica' }}</div>
          <div class="detalhes-full"><span class="detalhes-label">Endereço</span>{{ clienteSelecionado.logradouro || '—' }}, {{ clienteSelecionado.bairro || '—' }}, {{ clienteSelecionado.cidade || '—' }}/{{ clienteSelecionado.uf || '—' }}</div>
          <div><span class="detalhes-label">CEP</span>{{ clienteSelecionado.cep || '—' }}</div>
          <div><span class="detalhes-label">Telefone</span>{{ clienteSelecionado.telefone || '—' }}</div>
          <div><span class="detalhes-label">Celular</span>{{ clienteSelecionado.celular || '—' }}</div>
          <div><span class="detalhes-label">Email</span>{{ clienteSelecionado.email || '—' }}</div>
        </div>

        <h3 class="subtitulo">Veículos</h3>
        <table class="tabela">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Modelo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in veiculosDoCliente" :key="v.id">
              <template v-if="veiculoEditandoId === v.id">
                <td><input v-model="veiculoEmEdicao.placa" class="input-inline" /></td>
                <td><input v-model="veiculoEmEdicao.modelo" class="input-inline" /></td>
                <td class="acoes-veiculo">
                  <button class="btn-mini" :disabled="salvandoVeiculoEdicao" @click="salvarEdicaoVeiculo(v.id)">Salvar</button>
                  <button class="btn-mini btn-mini--neutro" @click="cancelarEdicaoVeiculo">Cancelar</button>
                </td>
              </template>
              <template v-else>
                <td>{{ v.placa }}</td>
                <td>{{ v.modelo || '—' }}</td>
                <td class="acoes-veiculo">
                  <button class="btn-mini" @click="iniciarEdicaoVeiculo(v)">Editar</button>
                  <button
                    class="btn-mini btn-mini--perigo"
                    :disabled="excluindoVeiculoId === v.id"
                    @click="excluirVeiculo(v.id)"
                  >
                    {{ excluindoVeiculoId === v.id ? 'Excluindo...' : 'Excluir' }}
                  </button>
                </td>
              </template>
            </tr>
            <tr v-if="veiculosDoCliente.length === 0">
              <td colspan="3" class="status">Nenhum veículo cadastrado para esse cliente.</td>
            </tr>
          </tbody>
        </table>

        <div class="add-veiculo-row">
          <input v-model="novoVeiculoDetalhe.placa" placeholder="Placa (ABC1D23)" class="input-placa" />
          <input v-model="novoVeiculoDetalhe.modelo" placeholder="Modelo (opcional)" class="input-modelo" />
          <button class="btn-add-veiculo" :disabled="salvandoVeiculoDetalhe" @click="adicionarVeiculoDetalhe">
            {{ salvandoVeiculoDetalhe ? 'Salvando...' : '+ Adicionar veículo' }}
          </button>
        </div>

        <h3 class="subtitulo">Histórico de Lavagens</h3>
        <table class="tabela">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Valor</th>
              <th>Pagamento</th>
              <th>Entrada</th>
              <th>Saída</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in historico" :key="l.id">
              <td>{{ l.placa || l.veiculo_placa || '—' }}</td>
              <td>R$ {{ Number(l.valor).toFixed(2) }}</td>
              <td>{{ l.forma_pagamento }}</td>
              <td>{{ new Date(l.horario_entrada).toLocaleString('pt-BR') }}</td>
              <td>{{ l.horario_saida ? new Date(l.horario_saida).toLocaleString('pt-BR') : '—' }}</td>
            </tr>
            <tr v-if="historico.length === 0">
              <td colspan="5" class="status">Esse cliente ainda não tem lavagens registradas.</td>
            </tr>
          </tbody>
        </table>
      </template>
    </section>

    <h1>Cadastro de Cliente</h1>

    <form class="form-wrapper" @submit.prevent="cadastrarCliente" autocomplete="off">
      <fieldset class="section">
        <legend>Dados Principais</legend>
        <div class="form-grid">
          <div class="field-group span-2">
            <label>Nome do Cliente:</label>
            <div class="row">
              <input v-model="cliente.codigo_pessoa" placeholder="Código" class="short" autocomplete="off" name="cli-codigo" />
              <input v-model="cliente.nome" placeholder="Nome ou Razão Social" required class="full" autocomplete="off" name="cli-nome" />
            </div>
          </div>

          <div class="field-group span-2">
            <label>Nome Fantasia:</label>
            <input v-model="cliente.nome_fantasia" autocomplete="off" name="cli-fantasia" />
          </div>

          <div class="field-group">
            <label>Tipo de Cliente:</label>
            <div class="radio-group">
              <label><input type="radio" value="Fisica" v-model="cliente.natureza" /> Pessoa Física</label>
              <label><input type="radio" value="Juridica" v-model="cliente.natureza" /> Pessoa Jurídica</label>
            </div>
          </div>

          <div class="field-group">
            <label>CPF ou CNPJ:</label>
            <input v-model="cliente.cpf_cnpj" autocomplete="off" name="cli-doc" />
          </div>

          <div class="field-group">
            <label>RG ou Inscrição Estadual:</label>
            <input v-model="cliente.ie_rg" autocomplete="off" name="cli-ierg" />
          </div>
        </div>
      </fieldset>

      <fieldset class="section">
        <legend>Endereço</legend>
        <div class="form-grid">
          <div class="field-group">
            <label>CEP:</label>
            <input v-model="cliente.cep" autocomplete="off" name="cli-cep" />
          </div>

          <div class="field-group span-2">
            <label>Rua / Avenida:</label>
            <input v-model="cliente.logradouro" autocomplete="off" name="cli-logradouro" />
          </div>

          <div class="field-group">
            <label>Bairro:</label>
            <input v-model="cliente.bairro" autocomplete="off" name="cli-bairro" />
          </div>

          <div class="field-group">
            <label>Cidade:</label>
            <input v-model="cliente.cidade" autocomplete="off" name="cli-cidade" />
          </div>

          <div class="field-group">
            <label>Estado (sigla):</label>
            <input v-model="cliente.uf" class="short" maxlength="2" placeholder="SC" autocomplete="off" name="cli-uf" style="text-transform: uppercase" />
          </div>
        </div>
      </fieldset>

      <fieldset class="section">
        <legend>Contato</legend>
        <div class="form-grid">
          <div class="field-group">
            <label>Telefone:</label>
            <input v-model="cliente.telefone" autocomplete="off" name="cli-telefone" />
          </div>

          <div class="field-group">
            <label>Celular:</label>
            <input v-model="cliente.celular" autocomplete="off" name="cli-celular" />
          </div>

          <div class="field-group span-2">
            <label>Email:</label>
            <input v-model="cliente.email" type="email" placeholder="cliente@exemplo.com" autocomplete="off" name="cli-email" />
          </div>
        </div>
      </fieldset>

      <fieldset class="section">
        <legend>Veículos</legend>
        <div v-for="(v, index) in veiculosNovoCliente" :key="index" class="veiculo-row">
          <input v-model="v.placa" placeholder="Placa (ABC1D23)" class="input-placa" autocomplete="off" />
          <input v-model="v.modelo" placeholder="Modelo (opcional)" class="input-modelo" autocomplete="off" />
          <button type="button" class="btn-remover-veiculo" @click="removerLinhaVeiculo(index)" v-if="veiculosNovoCliente.length > 1">
            ✕
          </button>
        </div>
        <button type="button" class="btn-add-linha" @click="adicionarLinhaVeiculo">+ Adicionar outro veículo</button>
      </fieldset>

      <div class="footer-row">
        <label class="checkbox-label">
          <input type="checkbox" v-model="cliente.cadastro_ativo" /> Cliente Ativo
        </label>
        <button type="submit" class="btn-save" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Salvar Cadastro' }}
        </button>
      </div>

      <p v-if="erro" class="erro-msg">{{ erro }}</p>
    </form>
  </div>
</template>

<style scoped>
.cliente-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.cliente-container h1 {
  margin-bottom: 0.5rem;
}
.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem 1.5rem;
}
.section legend {
  padding: 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.lista-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.header-botoes {
  display: flex;
  gap: 0.5rem;
}
.input-busca {
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius);
  min-width: 260px;
}
.tabela {
  width: 100%;
  border-collapse: collapse;
}
.tabela th, .tabela td {
  text-align: left;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}
.tabela th {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
}
.status {
  color: var(--text-secondary);
  text-align: center;
  padding: 1rem;
}
.btn-historico, .btn-fechar {
  padding: 0.4rem 0.9rem;
  background: var(--bg-secondary);
  color: var(--accent-light);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
}
.detalhes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}
.detalhes-full {
  grid-column: span 2;
}
.detalhes-label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 0.2rem;
}
.subtitulo {
  font-size: 0.9rem;
  color: var(--accent-light);
  margin: 1.25rem 0 0.5rem;
}
.acoes-veiculo {
  display: flex;
  gap: 0.4rem;
}
.input-inline {
  width: 100%;
  padding: 0.4rem 0.6rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius);
}
.btn-mini {
  padding: 0.3rem 0.7rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
.btn-mini--neutro {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}
.btn-mini--perigo {
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
}
.btn-mini:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.add-veiculo-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.input-placa {
  width: 160px;
  padding: 0.5rem 0.7rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius);
}
.input-modelo {
  flex: 1;
  padding: 0.5rem 0.7rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius);
}
.btn-add-veiculo {
  padding: 0.5rem 1rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
}
.btn-add-veiculo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.veiculo-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}
.btn-remover-veiculo {
  padding: 0 0.9rem;
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
}
.btn-add-linha {
  padding: 0.4rem 0.9rem;
  background: var(--bg-secondary);
  color: var(--accent-light);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 0.3rem;
}
.edicao-botoes {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1rem;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
  margin-top: 0.5rem;
}
.span-2 { grid-column: span 2; }
.field-group { display: flex; flex-direction: column; gap: 0.3rem; }
.field-group label { font-size: 0.8rem; color: var(--text-secondary); }
.field-group input {
  padding: 0.6rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius);
  transition: border-color 0.15s ease;
}
.field-group input:focus {
  outline: none;
  border-color: var(--accent);
}
.checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
.row { display: flex; gap: 0.5rem; }
.short { width: 100px; }
.full { flex: 1; }
.radio-group { display: flex; gap: 1.5rem; font-size: 0.9rem; align-items: center; height: 100%; }
.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-save {
  padding: 0.75rem 2rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.15s ease;
}
.btn-save:hover:not(:disabled) { opacity: 0.9; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.erro-msg {
  color: var(--danger);
  font-size: 0.85rem;
}
</style>