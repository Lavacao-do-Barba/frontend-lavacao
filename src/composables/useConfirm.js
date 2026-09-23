import { reactive } from 'vue'

const state = reactive({
  visivel: false,
  titulo: '',
  mensagem: '',
  resolver: null,
})

function confirmar(titulo, mensagem) {
  state.titulo = titulo
  state.mensagem = mensagem
  state.visivel = true
  return new Promise((resolve) => {
    state.resolver = resolve
  })
}

function responder(valor) {
  state.visivel = false
  if (state.resolver) state.resolver(valor)
  state.resolver = null
}

export function useConfirm() {
  return { state, confirmar, responder }
}