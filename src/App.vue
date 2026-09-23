<script setup>
import { useRoute } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
import ToastContainer from './components/ToastContainer.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'

const route = useRoute()
</script>

<template>
  <AppLayout v-if="route.meta.requiresAuth" />
  <router-view v-else />
  <ToastContainer />
  <ConfirmDialog />
</template>