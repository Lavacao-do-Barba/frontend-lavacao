<script setup>
import Sidebar from '../components/Sidebar.vue'
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <main class="app-layout__content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
}

.app-layout__content {
  margin-left: 240px;
  flex: 1;
  min-height: 100vh;
  background: var(--bg-primary);
}
</style>