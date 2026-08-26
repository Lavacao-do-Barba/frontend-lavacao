<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/auth'
import logo from '../assets/logo.png'

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
      <img :src="logo" alt="Lavação do Barba" class="login__logo" />
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
  background: radial-gradient(circle at top, var(--bg-secondary), var(--bg-primary) 70%);
}

.login__card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 2.5rem;
  border-radius: var(--radius);
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

.login__logo {
  width: 140px;
  object-fit: contain;
  margin-bottom: 0.5rem;
}

.login__subtitulo {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  align-self: flex-start;
}

.login__card label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.75rem;
  align-self: flex-start;
}

.login__card input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 0.95rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.login__card input:focus {
  outline: none;
  border-color: var(--accent-light);
}

.login__card button {
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.login__card button:hover {
  opacity: 0.92;
}

.login__card button:active {
  transform: scale(0.98);
}

.login__card button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login__erro {
  color: var(--danger);
  font-size: 0.85rem;
  align-self: flex-start;
}
</style>