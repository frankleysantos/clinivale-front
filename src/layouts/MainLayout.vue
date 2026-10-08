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

        <!-- Seleção / Informações da clínica ativa -->
        <q-btn-dropdown
          v-if="userClients.length > 0"
          flat
          dense
          no-caps
          icon="business"
          :label="clientName || 'Selecionar Clínica'"
          class="q-mr-sm"
        >
          <q-list style="min-width: 220px">
            <q-item-label header class="text-caption text-weight-bold text-uppercase">
              Trocar Clínica
            </q-item-label>
            <q-item
              v-for="c in userClients"
              :key="c.id"
              clickable
              v-close-popup
              :active="Number(c.id) === Number(authStore.user?.client?.id)"
              active-class="bg-blue-1 text-primary text-weight-bold"
              @click="handleSwitchClient(c)"
            >
              <q-item-section avatar style="min-width: 32px">
                <q-icon
                  :name="Number(c.id) === Number(authStore.user?.client?.id) ? 'check_circle' : 'storefront'"
                  :color="Number(c.id) === Number(authStore.user?.client?.id) ? 'primary' : 'grey-7'"
                  size="20px"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ c.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <div v-else class="row items-center q-gutter-sm q-mr-md gt-xs">
          <q-icon name="business" size="18px" />
          <span class="text-caption">{{ clientName }}</span>
        </div>

        <!-- Menu do usuário -->
        <q-btn flat dense round icon="account_circle">
          <q-tooltip>{{ userName }}</q-tooltip>
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 220px">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="person" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ userName }}</q-item-label>
                  <q-item-label caption>{{ roleNames || clientName }}</q-item-label>
                </q-item-section>
              </q-item>

              <template v-if="userClients.length > 1">
                <q-separator />
                <q-item-label header class="text-caption text-weight-bold text-uppercase">
                  Minhas Clínicas
                </q-item-label>
                <q-item
                  v-for="c in userClients"
                  :key="'menu-' + c.id"
                  clickable
                  v-close-popup
                  :active="Number(c.id) === Number(authStore.user?.client?.id)"
                  active-class="bg-blue-1 text-primary text-weight-bold"
                  @click="handleSwitchClient(c)"
                >
                  <q-item-section avatar style="min-width: 32px">
                    <q-icon
                      :name="Number(c.id) === Number(authStore.user?.client?.id) ? 'check_circle' : 'storefront'"
                      :color="Number(c.id) === Number(authStore.user?.client?.id) ? 'primary' : 'grey-7'"
                      size="20px"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ c.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>

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

          <!-- Perfis & Permissões -->
          <q-item
            clickable
            v-ripple
            :to="{ name: 'roles' }"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="admin_panel_settings" />
            </q-item-section>
            <q-item-section>Perfis & Permissões</q-item-section>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore, type Client } from 'src/stores/auth';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const { userName, clientName, userClients, roleNames } = storeToRefs(authStore);

const leftDrawerOpen = ref(false);

onMounted(async () => {
  try {
    await authStore.fetchMe();
  } catch (err) {
    console.error('Erro ao atualizar dados do usuário logado:', err);
  }
});

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function handleSwitchClient(client: Client) {
  const currentClientId = authStore.user?.client?.id;
  if (currentClientId && Number(client.id) === Number(currentClientId)) {
    return;
  }
  
  try {
    $q.loading?.show({ message: `Alternando para ${client.name}...` });
    await authStore.switchClient(Number(client.id));
    $q.notify({
      type: 'positive',
      message: `Clínica alterada para ${client.name}`,
      icon: 'check',
      position: 'top',
    });
    window.location.reload();
  } catch (error: any) {
    const msg = error?.response?.data?.message || 'Erro ao alternar de clínica';
    $q.notify({
      type: 'negative',
      message: msg,
      position: 'top',
    });
  } finally {
    $q.loading?.hide();
  }
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
