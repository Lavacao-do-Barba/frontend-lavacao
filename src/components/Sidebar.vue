<script setup>
import { useRouter } from 'vue-router'
import { logout } from '../services/auth'
import logo from '../assets/logo.png'

const links = [
  { nome: 'Dashboard', rota: '/', icone: '📊' },
  { nome: 'Lavagens', rota: '/lavagens', icone: '🚿' },
  { nome: 'Clientes', rota: '/clientes', icone: '👤' },
  { nome: 'Lista de Preços', rota: '/tabela-precos', icone: '🏷️' },
  { nome: 'Presença', rota: '/presenca', icone: '🗓️' },
  { nome: 'Relatórios', rota: '/relatorios', icone: '📈' },
  { nome: 'Veículos', rota: '/veiculos', icone: '🚚' },
  { nome: 'Pagamentos', rota: '/pagamentos', icone: '💳' },
  { nome: 'Configurações', rota: '/configuracoes', icone: '⚙️' },
]

const router = useRouter()

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <img :src="logo" alt="Lavação do Barba" class="sidebar__logo-img" />
    </div>

    <nav class="sidebar__nav">
      <ul>
        <li v-for="link in links" :key="link.rota">
          <router-link :to="link.rota" class="sidebar__link">
            <span class="sidebar__icon">{{ link.icone }}</span>
            {{ link.nome }}
          </router-link>
        </li>
      </ul>
    </nav>

    <button class="sidebar__logout" @click="handleLogout">Sair</button>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background: var(--bg-sidebar);
  padding: 1.5rem 1rem;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
}

.sidebar__brand {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 0.5rem;
}

.sidebar__logo-img {
  width: 100%;
  max-width: 160px;
  object-fit: contain;
}

.sidebar__nav {
  flex: 1;
  overflow-y: auto;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  transition: background 0.15s, color 0.15s;
}

.sidebar__link:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.router-link-active.sidebar__link {
  background: var(--accent);
  color: #fff;
}

.sidebar__icon {
  font-size: 1rem;
}

.sidebar__logout {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.65rem;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.85rem;
}

.sidebar__logout:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
</style>