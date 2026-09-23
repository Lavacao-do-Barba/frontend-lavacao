import { reactive } from 'vue'

const toasts = reactive([])
let nextId = 1

function push(mensagem, tipo = 'info', duracaoMs = 3500) {
  const id = nextId++
  toasts.push({ id, mensagem, tipo })
  setTimeout(() => remover(id), duracaoMs)
}

function remover(id) {
  const idx = toasts.findIndex(t => t.id === id)
  if (idx !== -1) toasts.splice(idx, 1)
}

export function useToast() {
  return {
    toasts,
    success: (msg, duracao) => push(msg, 'success', duracao),
    error: (msg, duracao) => push(msg, 'error', duracao),
    info: (msg, duracao) => push(msg, 'info', duracao),
    remover,
  }
}