<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const clientes = ref([])
const carregando = ref(true)
const salvando = ref(false)
const erro = ref('')

const cliente = ref({
  codigo_pessoa: '62362029',
  nome: '',
  nome_fantasia: '',
  natureza: 'Juridica',
  cpf_cnpj: '',
  ie_rg: 'ISENTO',
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
    <h1>Cadastro de Cliente</h1>

    <form class="form-grid" @submit.prevent="cadastrarCliente">
      <div class="field-group span-2">
        <label>Pessoa:</label>
        <div class="row">
          <input v-model="cliente.codigo_pessoa" class="short" />
          <input v-model="cliente.nome" placeholder="Razão Social / Nome" required class="full" />
        </div>
      </div>

      <div class="field-group span-2">
        <label>Nome Fantasia:</label>
        <input v-model="cliente.nome_fantasia" />
      </div>

      <div class="field-group">
        <label>Natureza:</label>
        <div class="radio-group">
          <label><input type="radio" value="Fisica" v-model="cliente.natureza" /> Física</label>
          <label><input type="radio" value="Juridica" v-model="cliente.natureza" /> Jurídica</label>
        </div>
      </div>

      <div class="field-group">
        <label>CNPJ/CPF:</label>
        <input v-model="cliente.cpf_cnpj" />
      </div>

      <div class="field-group">
        <label>IE/RG:</label>
        <input v-model="cliente.ie_rg" />
      </div>

      <div class="field-group">
        <label>CEP:</label>
        <input v-model="cliente.cep" />
      </div>

      <div class="field-group span-2">
        <label>Logradouro:</label>
        <input v-model="cliente.logradouro" />
      </div>

      <div class="field-group">
        <label>Bairro:</label>
        <input v-model="cliente.bairro" />
      </div>

      <div class="field-group">
        <label>Cidade:</label>
        <input v-model="cliente.cidade" />
      </div>

      <div class="field-group">
        <label>UF:</label>
        <input v-model="cliente.uf" class="short" />
      </div>

      <div class="field-group">
        <label>Telefone:</label>
        <input v-model="cliente.telefone" />
      </div>

      <div class="field-group">
        <label>Celular:</label>
        <input v-model="cliente.celular" />
      </div>

      <div class="field-group">
        <label>
          <input type="checkbox" v-model="cliente.cadastro_ativo" /> Cadastro Ativo
        </label>
      </div>

      <div class="span-2">
        <button type="submit" class="btn-save" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Salvar Cadastro' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.cliente-container { max-width: 1000px; margin: 0 auto; padding: 2rem; background: var(--bg-card); border-radius: var(--radius); }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.span-2 { grid-column: span 2; }
.field-group { display: flex; flex-direction: column; gap: 0.2rem; }
.field-group label { font-size: 0.8rem; color: var(--text-secondary); }
.field-group input { padding: 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: var(--radius); }
.row { display: flex; gap: 0.5rem; }
.short { width: 100px; }
.full { flex: 1; }
.radio-group { display: flex; gap: 1rem; font-size: 0.9rem; }
.btn-save { padding: 0.75rem 2rem; background: var(--accent); color: white; border: none; border-radius: var(--radius); cursor: pointer; font-weight: bold; }
</style>