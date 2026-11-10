<template>
  <q-page padding class="modern-dashboard">
    <!-- Top Welcome Banner Estilo PicPay Card -->
    <div class="hero-card q-pa-lg q-pa-sm-xl q-mb-lg q-mb-sm-xl">
      <div class="row items-center justify-between q-col-gutter-md">
        <div class="col-12 col-md-8">
          <div class="hero-badge q-mb-sm">Painel Geral</div>
          <div class="text-h4 text-weight-bolder text-white hero-title">
            Olá, {{ userName }}!
          </div>
          <div class="text-subtitle1 text-white opacity-85 q-mt-xs">
            Você está operando na unidade <span class="clinic-highlight">{{ clientName || 'Minha Saúde' }}</span>
          </div>
        </div>
        <div class="col-12 col-md-4 text-left text-md-right">
          <q-btn
            unelevated
            class="hero-action-btn lt-sm-full"
            icon="add"
            label="Novo Paciente"
            :to="{ name: 'patient-create' }"
          />
        </div>
      </div>
    </div>

    <!-- Grid de Métricas Principais -->
    <div class="row q-col-gutter-md q-col-gutter-sm-lg q-mb-lg q-mb-sm-xl">
      <!-- Pacientes -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="kpi-card" :to="{ name: 'patients' }">
          <q-card-section class="q-pa-md q-pa-sm-lg">
            <div class="row items-center justify-between no-wrap q-mb-sm">
              <span class="kpi-title">Pacientes</span>
              <div class="kpi-icon-box bg-green-soft">
                <q-icon name="person_outline" size="20px" color="primary" />
              </div>
            </div>
            <div class="kpi-value text-dark">
              <q-skeleton v-if="loadingStats" type="text" width="60px" />
              <span v-else>{{ stats.patients }}</span>
            </div>
            <div class="kpi-footer row items-center justify-between q-mt-md">
              <span class="text-caption text-grey-6">Fichas ativas</span>
              <q-icon name="arrow_forward" size="14px" color="primary" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Clínicas -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="kpi-card" :to="{ name: 'clients' }">
          <q-card-section class="q-pa-md q-pa-sm-lg">
            <div class="row items-center justify-between no-wrap q-mb-sm">
              <span class="kpi-title">Unidades</span>
              <div class="kpi-icon-box bg-dark-soft">
                <q-icon name="apartment" size="20px" color="dark" />
              </div>
            </div>
            <div class="kpi-value text-dark">
              <q-skeleton v-if="loadingStats" type="text" width="60px" />
              <span v-else>{{ stats.clients }}</span>
            </div>
            <div class="kpi-footer row items-center justify-between q-mt-md">
              <span class="text-caption text-grey-6">Rede de clínicas</span>
              <q-icon name="arrow_forward" size="14px" color="dark" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Usuários -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="kpi-card" :to="{ name: 'users' }">
          <q-card-section class="q-pa-md q-pa-sm-lg">
            <div class="row items-center justify-between no-wrap q-mb-sm">
              <span class="kpi-title">Equipe / Usuários</span>
              <div class="kpi-icon-box bg-green-soft">
                <q-icon name="groups" size="20px" color="primary" />
              </div>
            </div>
            <div class="kpi-value text-dark">
              <q-skeleton v-if="loadingStats" type="text" width="60px" />
              <span v-else>{{ stats.users }}</span>
            </div>
            <div class="kpi-footer row items-center justify-between q-mt-md">
              <span class="text-caption text-grey-6">Colaboradores</span>
              <q-icon name="arrow_forward" size="14px" color="primary" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Unidade Atual / Status -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="kpi-card kpi-dark-card" :to="{ name: 'roles' }">
          <q-card-section class="q-pa-md q-pa-sm-lg">
            <div class="row items-center justify-between no-wrap q-mb-sm">
              <span class="kpi-title text-white opacity-70">Unidade Ativa</span>
              <div class="kpi-icon-box bg-white-soft">
                <q-icon name="verified" size="20px" color="primary" />
              </div>
            </div>
            <div class="kpi-value text-white ellipsis" style="font-size: 1.25rem">
              {{ clientName || 'Clinivale' }}
            </div>
            <div class="kpi-footer row items-center justify-between q-mt-md">
              <span class="text-caption text-white opacity-80">Acessar perfis & roles</span>
              <q-icon name="arrow_forward" size="14px" color="primary" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Atalhos Rápidos no Estilo App PicPay -->
    <div class="row items-center justify-between q-mb-sm q-mb-sm-md">
      <div class="text-h6 text-weight-bolder text-dark" style="letter-spacing: -0.02em">
        Atalhos Rápidos
      </div>
    </div>

    <div class="row q-col-gutter-md q-col-gutter-sm-lg">
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat class="quick-action-tile cursor-pointer" @click="router.push({ name: 'patient-create' })">
          <q-card-section class="row items-center no-wrap q-pa-md q-pa-sm-lg">
            <div class="tile-icon-box bg-green-soft q-mr-md">
              <q-icon name="person_add_alt" size="22px" color="primary" />
            </div>
            <div class="col ellipsis">
              <div class="tile-title">Novo Paciente</div>
              <div class="tile-subtitle ellipsis">Cadastre fichas e prontuários</div>
            </div>
            <q-icon name="chevron_right" size="20px" color="grey-5" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat class="quick-action-tile cursor-pointer" @click="router.push({ name: 'roles' })">
          <q-card-section class="row items-center no-wrap q-pa-md q-pa-sm-lg">
            <div class="tile-icon-box bg-dark-soft q-mr-md">
              <q-icon name="admin_panel_settings" size="22px" color="dark" />
            </div>
            <div class="col ellipsis">
              <div class="tile-title">Perfis & Permissões</div>
              <div class="tile-subtitle ellipsis">Configure regras de acesso</div>
            </div>
            <q-icon name="chevron_right" size="20px" color="grey-5" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat class="quick-action-tile cursor-pointer" @click="router.push({ name: 'users' })">
          <q-card-section class="row items-center no-wrap q-pa-md q-pa-sm-lg">
            <div class="tile-icon-box bg-green-soft q-mr-md">
              <q-icon name="person_outline" size="22px" color="primary" />
            </div>
            <div class="col ellipsis">
              <div class="tile-title">Gerenciar Usuários</div>
              <div class="tile-subtitle ellipsis">Equipe médica e administrativa</div>
            </div>
            <q-icon name="chevron_right" size="20px" color="grey-5" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';

const router = useRouter();
const authStore = useAuthStore();
const { userName, clientName } = storeToRefs(authStore);

const loadingStats = ref(true);
const stats = reactive({
  patients: 0,
  clients: 0,
  users: 0,
});

async function loadStats() {
  loadingStats.value = true;
  try {
    const [patientsRes, clientsRes, usersRes] = await Promise.allSettled([
      api.get('/patients'),
      api.get('/clients'),
      api.get('/users'),
    ]);

    if (patientsRes.status === 'fulfilled') {
      stats.patients = Array.isArray(patientsRes.value.data) ? patientsRes.value.data.length : 0;
    }
    if (clientsRes.status === 'fulfilled') {
      stats.clients = Array.isArray(clientsRes.value.data) ? clientsRes.value.data.length : 0;
    }
    if (usersRes.status === 'fulfilled') {
      stats.users = Array.isArray(usersRes.value.data) ? usersRes.value.data.length : 0;
    }
  } finally {
    loadingStats.value = false;
  }
}

onMounted(() => {
  loadStats();
});
</script>

<style scoped lang="scss">
.modern-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.hero-card {
  background: linear-gradient(135deg, #11C76F 0%, #0A8B4C 100%);
  border-radius: 24px;
  box-shadow: 0 16px 36px rgba(17, 199, 111, 0.28);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
    pointer-events: none;
  }
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.22);
  color: #FFFFFF;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 999px;
}

.hero-title {
  letter-spacing: -0.03em;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
}

.clinic-highlight {
  font-weight: 800;
  text-decoration: underline;
  text-decoration-color: rgba(255, 255, 255, 0.4);
}

.hero-action-btn {
  background: #FFFFFF !important;
  color: #0D1612 !important;
  border-radius: 999px;
  font-weight: 800;
  padding: 10px 22px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  }

  &:active {
    transform: scale(0.97);
  }
}

.kpi-card {
  border-radius: 18px;
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px -2px rgba(11, 22, 18, 0.03);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px -4px rgba(17, 199, 111, 0.12);
  }

  &:active {
    transform: scale(0.98);
  }
}

.kpi-dark-card {
  background: linear-gradient(135deg, #12211A 0%, #09130F 100%) !important;
  border: none !important;
  box-shadow: 0 12px 28px rgba(9, 19, 15, 0.3) !important;
}

.kpi-title {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #72847D;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
}

.kpi-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-green-soft {
  background-color: rgba(17, 199, 111, 0.12);
}

.bg-dark-soft {
  background-color: rgba(13, 22, 18, 0.08);
}

.bg-white-soft {
  background-color: rgba(255, 255, 255, 0.15);
}

.quick-action-tile {
  border-radius: 18px;
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(17, 199, 111, 0.35);
    box-shadow: 0 10px 28px rgba(17, 199, 111, 0.12);
  }

  &:active {
    transform: scale(0.98);
  }
}

.tile-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tile-title {
  font-weight: 800;
  font-size: 0.95rem;
  color: #0B1612;
  letter-spacing: -0.01em;
}

.tile-subtitle {
  font-size: 0.78rem;
  color: #76867F;
  margin-top: 2px;
}

@media (max-width: 600px) {
  .lt-sm-full {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
