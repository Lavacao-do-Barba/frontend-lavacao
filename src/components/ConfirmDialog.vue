<script setup>
import { useConfirm } from '../composables/useConfirm'
const { state, responder } = useConfirm()
</script>

<template>
  <div v-if="state.visivel" class="confirm-overlay" @click.self="responder(false)">
    <div class="confirm-box">
      <h3>{{ state.titulo }}</h3>
      <p>{{ state.mensagem }}</p>
      <div class="confirm-botoes">
        <button class="btn-neutro" @click="responder(false)">Cancelar</button>
        <button class="btn-perigo" @click="responder(true)">Confirmar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}
.confirm-box {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.5rem;
  max-width: 380px;
  width: 90%;
}
.confirm-box h3 { margin-bottom: 0.5rem; }
.confirm-box p { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.25rem; }
.confirm-botoes { display: flex; justify-content: flex-end; gap: 0.6rem; }
.btn-neutro {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
}
.btn-perigo {
  padding: 0.5rem 1rem;
  background: var(--danger, #e74c3c);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
}
</style>