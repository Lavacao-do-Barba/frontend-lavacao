<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/auth'

const cnpj = ref('')
const password = ref('')
const erro = ref('')
const carregando = ref(false)

const router = useRouter()

async function handleSubmit() {
  erro.value = ''
  carregando.value = true

  try {
    await login(cnpj.value, password.value)
    router.push('/')
  } catch (e) {
    erro.value = 'CNPJ ou senha inválidos.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="login">
    <form class="login__card" @submit.prevent="handleSubmit">
      <h1>Lavação do Barba</h1>
      <p class="login__subtitulo">Acesse sua conta</p>

      <label for="cnpj">CNPJ</label>
      <input id="cnpj" v-model="cnpj" type="text" placeholder="00.000.000/0000-00" required />

      <label for="password">Senha</label>
      <input id="password" v-model="password" type="password" placeholder="••••••••" required />

      <p v-if="erro" class="login__erro">{{ erro }}</p>

      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f4f5f7;
}

.login__card {
  background: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.login__card h1 {
  font-size: 1.3rem;
}

.login__subtitulo {
  color: #666;
  margin-bottom: 1rem;
}

.login__card label {
  font-size: 0.85rem;
  color: #444;
  margin-top: 0.75rem;
}

.login__card input {
  padding: 0.65rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}

.login__card button {
  margin-top: 1.5rem;
  padding: 0.75rem;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.login__card button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login__erro {
  color: #d33;
  font-size: 0.85rem;
}
</style>