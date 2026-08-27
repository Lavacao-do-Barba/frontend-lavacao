<script setup>
import { useRouter } from 'vue-router'
import { logout } from '../services/auth'
import logo from '../assets/logo.png'

const links = [
  { nome: 'Dashboard', rota: '/', icone: '📊' },
  { nome: 'Lavagens', rota: '/lavagens', icone: '🚿' },
  { nome: 'Clientes', rota: '/clientes', icone: '👤' },
  { nome: 'Lista de Preços', rota: '/tabela-precos', icone: '🏷️' },
  { nome: 'Funcionários', rota: '/funcionarios', icone: '👥' },
  { nome: 'Rampas', rota: '/rampas', icone: '🏗️' },
  { nome: 'Presença', rota: '/presenca', icone: '🗓️' },
  { nome: 'Relatórios', rota: '/relatorios', icone: '📈' },
  { nome: 'Veículos', rota: '/veiculos', icone: '🚚' },
  { nome: 'Pagamentos', rota: '/pagamentos', icone: '💳' },
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
            <span class="sidebar__label">{{ link.nome }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="sidebar__footer">
      <button class="sidebar__logout" @click="handleLogout">
        <span class="sidebar__icon">🚪</span>
        <span>Sair do sistema</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: var(--bg-sidebar);
  padding: 1.5rem 1rem;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  z-index: 100;
}

.sidebar__brand {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
}

.sidebar__logo-img {
  width: 100%;
  max-width: 160px;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.sidebar__logo-img:hover {
  transform: scale(1.03);
}

.sidebar__nav {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.25rem;
}

/* Custom Scrollbar para o menu navigation */
.sidebar__nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar__nav::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.sidebar__nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.sidebar__link:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
  transform: translateX(3px);
}

.router-link-active.sidebar__link {
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sidebar__icon {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar__label {
  flex: 1;
}

.sidebar__footer {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0.5rem;
}

.sidebar__logout {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.2);
  color: var(--danger, #f87171);
  padding: 0.7rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.sidebar__logout:hover {
  background: var(--danger, #f87171);
  color: #fff;
  border-color: var(--danger, #f87171);
}
</style>