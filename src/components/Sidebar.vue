<script setup>
import { useRouter } from 'vue-router'
import { logout } from '../services/auth'

const links = [
  { nome: 'Dashboard', rota: '/' },
]

const router = useRouter()

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <h2 class="sidebar__logo">Lavação do Barba</h2>
    <nav>
      <ul>
        <li v-for="link in links" :key="link.rota">
          <router-link :to="link.rota">{{ link.nome }}</router-link>
        </li>
      </ul>
    </nav>
    <button class="sidebar__logout" @click="handleLogout">Sair</button>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: #1a1a1a;
  color: #fff;
  padding: 1.5rem 1rem;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
}

.sidebar__logo {
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.sidebar nav {
  flex: 1;
}

.sidebar nav ul li {
  padding: 0.5rem 0;
}

.sidebar nav ul li a {
  color: #ccc;
}

.sidebar nav ul li a:hover {
  color: #fff;
}

.sidebar__logout {
  background: transparent;
  border: 1px solid #444;
  color: #ccc;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.sidebar__logout:hover {
  background: #333;
  color: #fff;
}
</style>