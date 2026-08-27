import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Lavagens from '../views/Lavagens.vue'
import Relatorios from '../views/Relatorios.vue'
import Veiculos from '../views/Veiculos.vue'
import Pagamentos from '../views/Pagamentos.vue'
import Configuracoes from '../views/Configuracoes.vue'
import Presenca from '../views/Presenca.vue'
import TabelaPrecos from '../views/TabelaPrecos.vue'
import Clientes from '../views/Clientes.vue'
import { isAuthenticated } from '../services/auth'

const routes = [
  { path: '/login', name: 'login', component: Login },
  { path: '/', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/lavagens', name: 'lavagens', component: Lavagens, meta: { requiresAuth: true } },
  { path: '/clientes', name: 'clientes', component: Clientes, meta: { requiresAuth: true } },
  { path: '/tabela-precos', name: 'tabela-precos', component: TabelaPrecos, meta: { requiresAuth: true } },
  { path: '/relatorios', name: 'relatorios', component: Relatorios, meta: { requiresAuth: true } },
  { path: '/veiculos', name: 'veiculos', component: Veiculos, meta: { requiresAuth: true } },
  { path: '/pagamentos', name: 'pagamentos', component: Pagamentos, meta: { requiresAuth: true } },
  { path: '/configuracoes', name: 'configuracoes', component: Configuracoes, meta: { requiresAuth: true } },
  { path: '/presenca', name: 'presenca', component: Presenca, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { name: 'login' }
  }
})

export default router