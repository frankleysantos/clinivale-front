<template>
  <q-layout view="lHh Lpr lFf" class="picpay-app-layout">
    <!-- Header Estilo App PicPay -->
    <q-header class="picpay-header text-dark">
      <q-toolbar class="q-px-md q-px-sm-lg">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="q-mr-xs text-grey-8 gt-xs"
          @click="toggleLeftDrawer"
        />

        <div class="row items-center cursor-pointer logo-group" @click="router.push({ name: 'dashboard' })">
          <div class="picpay-icon-box q-mr-sm">
            <q-icon name="local_pharmacy" size="20px" color="white" />
          </div>
          <div>
            <span class="brand-title">Minha Saúde</span>
          </div>
        </div>

        <q-space />

        <!-- Seleção da clínica ativa com visual de Chip / Pill PicPay -->
        <q-btn-dropdown
          v-if="userClients.length > 0"
          unelevated
          no-caps
          class="clinic-chip q-mr-xs"
        >
          <template #label>
            <div class="row items-center no-wrap">
              <div class="pulse-dot q-mr-xs"></div>
              <span class="clinic-text ellipsis">
                {{ clientName || 'Selecionar' }}
              </span>
            </div>
          </template>

          <q-list class="q-pa-xs" style="min-width: 250px; border-radius: 16px">
            <div class="q-pa-sm text-caption text-weight-bolder text-uppercase text-grey-6">
              Alternar Unidade
            </div>
            <q-item
              v-for="c in userClients"
              :key="c.id"
              clickable
              v-close-popup
              class="clinic-opt-item q-my-xs rounded-borders"
              :active="Number(c.id) === Number(authStore.user?.client?.id)"
              active-class="clinic-opt-active"
              @click="handleSwitchClient(c)"
            >
              <q-item-section avatar style="min-width: 32px">
                <q-icon
                  :name="Number(c.id) === Number(authStore.user?.client?.id) ? 'check_circle' : 'apartment'"
                  :color="Number(c.id) === Number(authStore.user?.client?.id) ? 'primary' : 'grey-5'"
                  size="18px"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ c.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Menu do Usuário com Avatar PicPay -->
        <q-btn flat round dense class="user-avatar-btn">
          <div class="picpay-avatar">
            <span>{{ userInitials }}</span>
          </div>

          <q-menu anchor="bottom right" self="top right" class="user-popup-menu">
            <div class="q-pa-md bg-grey-1 row items-center no-wrap">
              <div class="picpay-avatar-lg q-mr-md">
                <span>{{ userInitials }}</span>
              </div>
              <div class="ellipsis">
                <div class="text-weight-bolder text-dark text-subtitle2">{{ userName }}</div>
                <div class="text-caption text-grey-6 ellipsis">{{ roleNames || clientName }}</div>
              </div>
            </div>

            <q-separator />

            <q-list class="q-pa-xs">
              <template v-if="userClients.length > 1">
                <div class="q-px-sm q-pt-sm text-caption text-weight-bold text-grey-6 text-uppercase">
                  Minhas Clínicas
                </div>
                <q-item
                  v-for="c in userClients"
                  :key="'menu-' + c.id"
                  clickable
                  v-close-popup
                  class="rounded-borders q-my-xs"
                  :active="Number(c.id) === Number(authStore.user?.client?.id)"
                  active-class="clinic-opt-active"
                  @click="handleSwitchClient(c)"
                >
                  <q-item-section avatar style="min-width: 30px">
                    <q-icon
                      :name="Number(c.id) === Number(authStore.user?.client?.id) ? 'check_circle' : 'apartment'"
                      :color="Number(c.id) === Number(authStore.user?.client?.id) ? 'primary' : 'grey-5'"
                      size="18px"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ c.name }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator class="q-my-xs" />
              </template>

              <q-item clickable v-close-popup @click="handleLogout" class="text-negative rounded-borders">
                <q-item-section avatar style="min-width: 30px">
                  <q-icon name="logout" color="negative" size="18px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Sair do App</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Sidebar Desktop Clean PicPay -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="260"
      :breakpoint="900"
      class="picpay-sidebar gt-xs"
    >
      <div class="sidebar-wrapper fit column justify-between">
        <q-scroll-area class="col q-px-sm q-py-lg">
          <div class="row items-center q-px-sm q-mb-xl">
            <div class="picpay-icon-box-lg q-mr-md">
              <q-icon name="local_pharmacy" size="24px" color="white" />
            </div>
            <div>
              <div class="brand-title-main">Minha Saúde</div>
              <div class="brand-sub-badge">Ecossistema Clínico</div>
            </div>
          </div>

          <!-- Itens da Sidebar -->
          <div class="nav-container q-gutter-y-xs">
            <q-item
              clickable
              v-ripple
              :to="{ name: 'dashboard' }"
              class="sidebar-item"
              active-class="sidebar-item-active"
              exact
            >
              <q-item-section avatar>
                <q-icon name="grid_view" size="20px" />
              </q-item-section>
              <q-item-section class="sidebar-label">Início / Dashboard</q-item-section>
            </q-item>

            <div v-if="authStore.hasPermission('PatientController') || authStore.hasPermission('ClientController')" class="sidebar-section-header">
              Atendimento
            </div>

            <!-- Pacientes -->
            <q-item
              v-if="authStore.hasPermission('PatientController')"
              clickable
              v-ripple
              :to="{ name: 'patients' }"
              class="sidebar-item"
              active-class="sidebar-item-active"
            >
              <q-item-section avatar>
                <q-icon name="person_outline" size="20px" />
              </q-item-section>
              <q-item-section class="sidebar-label">Pacientes</q-item-section>
            </q-item>

            <!-- Clientes -->
            <q-item
              v-if="authStore.hasPermission('ClientController')"
              clickable
              v-ripple
              :to="{ name: 'clients' }"
              class="sidebar-item"
              active-class="sidebar-item-active"
            >
              <q-item-section avatar>
                <q-icon name="apartment" size="20px" />
              </q-item-section>
              <q-item-section class="sidebar-label">Unidades / Clientes</q-item-section>
            </q-item>

            <div v-if="authStore.hasPermission('UserController') || authStore.hasPermission('RolesController')" class="sidebar-section-header">
              Configurações
            </div>

            <!-- Usuários -->
            <q-item
              v-if="authStore.hasPermission('UserController')"
              clickable
              v-ripple
              :to="{ name: 'users' }"
              class="sidebar-item"
              active-class="sidebar-item-active"
            >
              <q-item-section avatar>
                <q-icon name="groups" size="20px" />
              </q-item-section>
              <q-item-section class="sidebar-label">Usuários</q-item-section>
            </q-item>

            <!-- Perfis & Permissões -->
            <q-item
              v-if="authStore.hasPermission('RolesController')"
              clickable
              v-ripple
              :to="{ name: 'roles' }"
              class="sidebar-item"
              active-class="sidebar-item-active"
            >
              <q-item-section avatar>
                <q-icon name="verified_user" size="20px" />
              </q-item-section>
              <q-item-section class="sidebar-label">Perfis & Permissões</q-item-section>
            </q-item>
          </div>
        </q-scroll-area>

        <div class="q-pa-sm">
          <div class="sidebar-footer-card q-pa-sm row items-center justify-between">
            <div class="row items-center no-wrap">
              <div class="status-pulse-dot q-mr-sm"></div>
              <div class="text-caption text-weight-bold text-dark ellipsis" style="max-width: 140px">
                {{ clientName || 'Minha Saúde' }}
              </div>
            </div>
            <q-btn flat round dense icon="power_settings_new" color="negative" size="sm" @click="handleLogout">
              <q-tooltip>Sair</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </q-drawer>

    <!-- Barra de Navegação Inferior estilo App Mobile do PicPay -->
    <nav class="mobile-bottom-nav lt-sm">
      <div
        class="bottom-nav-item"
        :class="{ active: $route.name === 'dashboard' }"
        @click="router.push({ name: 'dashboard' })"
      >
        <q-icon name="grid_view" size="22px" />
        <span>Início</span>
      </div>

      <div
        v-if="authStore.hasPermission('PatientController')"
        class="bottom-nav-item"
        :class="{ active: $route.name?.toString().includes('patient') }"
        @click="router.push({ name: 'patients' })"
      >
        <q-icon name="person_outline" size="22px" />
        <span>Pacientes</span>
      </div>

      <div
        v-if="authStore.hasPermission('ClientController')"
        class="bottom-nav-item"
        :class="{ active: $route.name === 'clients' }"
        @click="router.push({ name: 'clients' })"
      >
        <q-icon name="apartment" size="22px" />
        <span>Unidades</span>
      </div>

      <div
        v-if="authStore.hasPermission('UserController')"
        class="bottom-nav-item"
        :class="{ active: $route.name === 'users' }"
        @click="router.push({ name: 'users' })"
      >
        <q-icon name="groups" size="22px" />
        <span>Equipe</span>
      </div>

      <div
        v-if="authStore.hasPermission('RolesController')"
        class="bottom-nav-item"
        :class="{ active: $route.name === 'roles' }"
        @click="router.push({ name: 'roles' })"
      >
        <q-icon name="verified_user" size="22px" />
        <span>Perfis</span>
      </div>
    </nav>

    <!-- Conteúdo principal -->
    <q-page-container class="picpay-container">
      <div class="content-wrapper">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore, type Client } from 'src/stores/auth';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const { user, userName, clientName, roleNames, userClients } = storeToRefs(authStore);

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const userInitials = computed(() => {
  if (!userName.value) return 'U';
  const parts = userName.value.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
});

async function handleSwitchClient(client: Client) {
  if (Number(client.id) === Number(authStore.user?.client?.id)) return;

  try {
    $q.loading.show({ message: `Alternando para ${client.name}...` });
    await authStore.switchClient(client.id);
    $q.notify({
      type: 'positive',
      message: `Clínica alterada para: ${client.name}`,
      position: 'top',
    });
    router.go(0);
  } catch (error: any) {
    const msg = error?.response?.data?.message || 'Erro ao alternar clínica.';
    $q.notify({ type: 'negative', message: msg, position: 'top' });
  } finally {
    $q.loading.hide();
  }
}

function handleLogout() {
  authStore.logout();
  router.push({ name: 'login' });
}

onMounted(async () => {
  if (authStore.isAuthenticated && !user.value?.clients) {
    try {
      await authStore.fetchMe();
    } catch {
      // Token expirado
    }
  }
});
</script>

<style scoped lang="scss">
.picpay-app-layout {
  background-color: #F5F7F6;
}

.picpay-header {
  background: #FFFFFF !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  height: 60px;
  display: flex;
  align-items: center;
}

.picpay-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #11C76F 0%, #0A8B4C 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(17, 199, 111, 0.35);
}

.picpay-icon-box-lg {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #11C76F 0%, #0A8B4C 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 14px rgba(17, 199, 111, 0.35);
}

.brand-title {
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: -0.02em;
  color: #0B1612;
}

.brand-title-main {
  font-weight: 800;
  font-size: 1.12rem;
  letter-spacing: -0.02em;
  color: #0B1612;
}

.brand-sub-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: #11C76F;
}

.clinic-chip {
  border-radius: 999px;
  background: #EBF1EE;
  padding: 4px 12px;
  transition: all 0.2s ease;

  &:hover {
    background: #E2ECE7;
  }
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #11C76F;
  box-shadow: 0 0 6px rgba(17, 199, 111, 0.8);
}

.clinic-text {
  max-width: 140px;
  font-weight: 700;
  font-size: 0.85rem;
  color: #0B1612;
}

.clinic-opt-active {
  background: rgba(17, 199, 111, 0.12) !important;
  color: #0A8B4C !important;
  font-weight: 800 !important;
}

.picpay-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #11C76F;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.82rem;
  box-shadow: 0 3px 8px rgba(17, 199, 111, 0.3);
}

.picpay-avatar-lg {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #11C76F;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
}

.picpay-sidebar {
  background: #FFFFFF !important;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.sidebar-section-header {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8C9C95;
  padding: 16px 12px 6px;
}

.sidebar-item {
  border-radius: 14px;
  color: #556660;
  margin-bottom: 4px;
  padding: 10px 14px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #F0F5F2;
    color: #0B1612;
  }

  &.sidebar-item-active {
    background: linear-gradient(90deg, rgba(17, 199, 111, 0.15) 0%, rgba(17, 199, 111, 0.05) 100%) !important;
    color: #0A8B4C !important;
    font-weight: 800;

    .q-icon {
      color: #11C76F !important;
    }
  }
}

.sidebar-label {
  font-size: 0.9rem;
  font-weight: 600;
}

.sidebar-footer-card {
  border-radius: 14px;
  background: #F0F4F2;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.status-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #11C76F;
  box-shadow: 0 0 6px rgba(17, 199, 111, 0.8);
}

// Bottom Nav Mobile
.mobile-bottom-nav {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #FFFFFF;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
  z-index: 2000;
  align-items: center;
  justify-content: space-around;

  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #72847D;
    font-size: 0.68rem;
    font-weight: 700;
    transition: all 0.2s ease;
    cursor: pointer;

    .q-icon {
      margin-bottom: 2px;
      transition: transform 0.2s ease;
    }

    &:active {
      transform: scale(0.92);
    }

    &.active {
      color: #11C76F;

      .q-icon {
        transform: translateY(-2px);
      }
    }
  }
}

.content-wrapper {
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}
</style>
