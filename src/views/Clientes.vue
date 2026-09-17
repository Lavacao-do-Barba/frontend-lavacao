<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const clientes = ref([])
const carregando = ref(true)
const salvando = ref(false)
const erro = ref('')
const filtro = ref('')

const clienteSelecionado = ref(null)
const historico = ref([])
const carregandoHistorico = ref(false)

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

const clientesFiltrados = computed(() => {
  if (!filtro.value) return clientes.value
  const termo = filtro.value.toLowerCase()
  return clientes.value.filter(c =>
    (c.nome || '').toLowerCase().includes(termo) ||
    (c.cpf_cnpj || '').toLowerCase().includes(termo) ||
    (c.telefone || '').toLowerCase().includes(termo)
  )
})

async function carregarClientes() {
  const res = await api.get('/api/clientes/')
  clientes.value = res.data.results || res.data
}

async function cadastrarCliente() {
  salvando.value = true
  try {
    await api.post('/api/clientes/', cliente.value)
    alert('Cliente salvo com sucesso!')
    await carregarClientes()
  } catch (e) {
    erro.value = 'Erro ao cadastrar cliente.'
  } finally {
    salvando.value = false
  }
}

async function verHistorico(c) {
  clienteSelecionado.value = c
  carregandoHistorico.value = true
  historico.value = []
  try {
    const res = await api.get('/api/lavagens/', { params: { cliente: c.id } })
    historico.value = res.data.results || res.data
  } catch (e) {
    erro.value = 'Não foi possível carregar o histórico desse cliente.'
  } finally {
    carregandoHistorico.value = false
  }
}

function fecharHistorico() {
  clienteSelecionado.value = null
  historico.value = []
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
              <button class="btn-historico" @click="verHistorico(c)">Ver histórico</button>
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
        <legend>Histórico de {{ clienteSelecionado.nome }}</legend>
        <button class="btn-fechar" @click="fecharHistorico">Fechar</button>
      </div>

      <p v-if="carregandoHistorico" class="status">Carregando histórico...</p>
      <table v-else class="tabela">
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

      <div class="footer-row">
        <label class="checkbox-label">
          <input type="checkbox" v-model="cliente.cadastro_ativo" /> Cliente Ativo
        </label>
        <button type="submit" class="btn-save" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Salvar Cadastro' }}
        </button>
      </div>
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
.row { display: flex; gap: 0.5rem; }
.short { width: 100px; }
.full { flex: 1; }
.radio-group { display: flex; gap: 1.5rem; font-size: 0.9rem; align-items: center; height: 100%; }
.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
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
</style>