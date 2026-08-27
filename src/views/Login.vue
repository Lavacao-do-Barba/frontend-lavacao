<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/auth'
import logo from '../assets/logo.png'

const cnpj = ref('')
const password = ref('')
const mostrarSenha = ref(false)
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
      <h1 class="login__titulo">Bem-vindo de volta</h1>
      <p class="login__subtitulo">Acesse sua conta para continuar</p>

      <label for="cnpj">CNPJ</label>
      <input id="cnpj" v-model="cnpj" type="text" placeholder="00.000.000/0000-00" required />

      <label for="password">Senha</label>
      <div class="login__campo-senha">
        <input
          id="password"
          v-model="password"
          :type="mostrarSenha ? 'text' : 'password'"
          placeholder="••••••••"
          required
        />
        <button type="button" class="login__toggle-senha" @click="mostrarSenha = !mostrarSenha">
          {{ mostrarSenha ? 'Ocultar' : 'Mostrar' }}
        </button>
      </div>

      <p v-if="erro" class="login__erro">{{ erro }}</p>

      <button type="submit" class="login__botao-entrar" :disabled="carregando">
        {{ carregando ? 'Entrando...' : 'Entrar' }}
      </button>

      <p class="login__rodape">Lavação do Barba © {{ new Date().getFullYear() }}</p>
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
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

.login__logo {
  width: 120px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.login__titulo {
  font-size: 1.4rem;
  align-self: flex-start;
}

.login__subtitulo {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  align-self: flex-start;
  font-size: 0.9rem;
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

.login__campo-senha {
  width: 100%;
  display: flex;
  gap: 0;
}

.login__campo-senha input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.login__toggle-senha {
  padding: 0 0.9rem;
  background: var(--bg-secondary);
  color: var(--accent-light);
  border: 1px solid var(--border-color);
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.login__toggle-senha:hover {
  background: var(--accent);
  color: #fff;
}

.login__botao-entrar {
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

.login__botao-entrar:hover {
  opacity: 0.92;
}

.login__botao-entrar:active {
  transform: scale(0.98);
}

.login__botao-entrar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login__erro {
  color: var(--danger);
  font-size: 0.85rem;
  align-self: flex-start;
}

.login__rodape {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}
</style>