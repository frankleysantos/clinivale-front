<template>
  <q-layout view="lHh Lpr lFf" class="auth-layout">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Layout com estilo moderno PicPay Dark/Green
</script>

<style scoped>
.auth-layout {
  background: radial-gradient(circle at 15% 20%, #0D281C 0%, #081610 50%, #030806 100%);
  min-height: 100vh;
}
</style>
