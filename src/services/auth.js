import api from './api'

export async function login(cnpj, password) {
  const response = await api.post('/api/token/', { cnpj, password })
  const { access, refresh } = response.data

  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)

  return response.data
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function isAuthenticated() {
  return !!localStorage.getItem('access_token')
}