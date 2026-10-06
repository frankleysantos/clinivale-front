<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="row items-center gap-2">
          <q-icon name="local_pharmacy" size="28px" class="q-mr-sm" />
          <span class="text-weight-bold">Minha Saúde</span>
        </q-toolbar-title>

        <q-space />

        <!-- Informações do cliente logado -->
        <div class="row items-center q-gutter-sm q-mr-md gt-xs">
          <q-icon name="business" size="18px" />
          <span class="text-caption">{{ clientName }}</span>
        </div>

        <!-- Menu do usuário -->
        <q-btn flat dense round icon="account_circle">
          <q-tooltip>{{ userName }}</q-tooltip>
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 180px">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="person" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ userName }}</q-item-label>
                  <q-item-label caption>{{ clientName }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-negative">Sair</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Sidebar -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="240"
      :breakpoint="700"
      class="bg-grey-1"
    >
      <q-scroll-area class="fit">
        <!-- Logo / Cabeçalho do drawer -->
        <div class="q-pa-md row items-center bg-primary text-white">
          <q-icon name="local_pharmacy" size="32px" class="q-mr-sm" />
          <div>
            <div class="text-weight-bold text-subtitle1">Minha Saúde</div>
            <div class="text-caption opacity-80">Sistema Farmacêutico</div>
          </div>
        </div>

        <q-list padding>
          <!-- Dashboard -->
          <q-item
            clickable
            v-ripple
            :to="{ name: 'dashboard' }"
            active-class="bg-primary text-white"
            exact
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />
          <q-item-label header class="text-grey-6 text-caption text-uppercase">
            Cadastros
          </q-item-label>

          <!-- Pacientes -->
          <q-item
            clickable
            v-ripple
            :to="{ name: 'patients' }"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="people" />
            </q-item-section>
            <q-item-section>Pacientes</q-item-section>
          </q-item>

          <!-- Clientes -->
          <q-item
            clickable
            v-ripple
            :to="{ name: 'clients' }"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="business" />
            </q-item-section>
            <q-item-section>Clientes</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />
          <q-item-label header class="text-grey-6 text-caption text-uppercase">
            Administração
          </q-item-label>

          <!-- Usuários -->
          <q-item
            clickable
            v-ripple
            :to="{ name: 'users' }"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="manage_accounts" />
            </q-item-section>
            <q-item-section>Usuários</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <!-- Sair -->
          <q-item clickable v-ripple @click="handleLogout" class="text-negative">
            <q-item-section avatar>
              <q-icon name="logout" color="negative" />
            </q-item-section>
            <q-item-section>Sair</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Conteúdo principal -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const { userName, clientName } = storeToRefs(authStore);

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function handleLogout() {
  $q.dialog({
    title: 'Sair do sistema',
    message: 'Deseja realmente sair?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    authStore.logout();
    void router.push({ name: 'login' });
  });
}
</script>
