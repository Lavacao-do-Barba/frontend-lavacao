<script setup>
import { useToast } from '../composables/useToast'
const { toasts, remover } = useToast()
</script>

<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :class="`toast--${t.tipo}`"
        @click="remover(t.id)"
      >
        {{ t.mensagem }}
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.toast {
  min-width: 240px;
  max-width: 360px;
  padding: 0.85rem 1.1rem;
  border-radius: var(--radius);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}
.toast--success { background: var(--success, #2ecc71); }
.toast--error { background: var(--danger, #e74c3c); }
.toast--info { background: var(--accent, #3b82f6); }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateX(30px); }
.toast-leave-to { opacity: 0; transform: translateX(30px); }
</style>