<template>
  <q-layout view="lHh Lpr lFf" class="auth-layout">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Layout simples sem header/sidebar para telas de autenticação
</script>

<style scoped>
.auth-layout {
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%);
  min-height: 100vh;
}
</style>
