<template>
  <q-page padding>
    <div class="q-mb-lg">
      <div class="text-h5 text-weight-bold text-primary">Dashboard</div>
      <div class="text-caption text-grey-6">
        Bem-vindo, {{ userName }}! Aqui está o resumo do sistema.
      </div>
    </div>

    <!-- Cards de resumo -->
    <div class="row q-gutter-md q-mb-xl">
      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-grey-6 text-uppercase">Pacientes</div>
              <div class="text-h4 text-weight-bold text-primary">
                <q-skeleton v-if="loadingStats" type="text" width="60px" />
                <span v-else>{{ stats.patients }}</span>
              </div>
            </div>
            <q-icon name="people" size="48px" color="primary" class="opacity-30" />
          </q-card-section>
          <q-card-actions>
            <q-btn flat dense color="primary" label="Ver todos" :to="{ name: 'patients' }" />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-grey-6 text-uppercase">Clientes</div>
              <div class="text-h4 text-weight-bold text-teal">
                <q-skeleton v-if="loadingStats" type="text" width="60px" />
                <span v-else>{{ stats.clients }}</span>
              </div>
            </div>
            <q-icon name="business" size="48px" color="teal" class="opacity-30" />
          </q-card-section>
          <q-card-actions>
            <q-btn flat dense color="teal" label="Ver todos" :to="{ name: 'clients' }" />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-grey-6 text-uppercase">Usuários</div>
              <div class="text-h4 text-weight-bold text-purple">
                <q-skeleton v-if="loadingStats" type="text" width="60px" />
                <span v-else>{{ stats.users }}</span>
              </div>
            </div>
            <q-icon name="manage_accounts" size="48px" color="purple" class="opacity-30" />
          </q-card-section>
          <q-card-actions>
            <q-btn flat dense color="purple" label="Ver todos" :to="{ name: 'users' }" />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-xs-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card bg-primary text-white">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-white opacity-70 text-uppercase">Estabelecimento</div>
              <div class="text-subtitle1 text-weight-bold q-mt-xs">{{ clientName }}</div>
            </div>
            <q-icon name="local_pharmacy" size="48px" color="white" class="opacity-30" />
          </q-card-section>
          <q-card-actions>
            <q-btn flat dense color="white" label="Novo paciente" :to="{ name: 'patient-create' }" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Ações rápidas -->
    <div class="text-subtitle1 text-weight-bold q-mb-md">Ações rápidas</div>
    <div class="row q-gutter-md">
      <q-btn
        unelevated
        color="primary"
        icon="person_add"
        label="Novo Paciente"
        :to="{ name: 'patient-create' }"
      />
      <q-btn
        unelevated
        color="teal"
        icon="people"
        label="Listar Pacientes"
        :to="{ name: 'patients' }"
      />
      <q-btn
        unelevated
        color="purple"
        icon="manage_accounts"
        label="Gerenciar Usuários"
        :to="{ name: 'users' }"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import { usePatientsStore } from 'src/stores/patients';
import { useClientsStore } from 'src/stores/clients';
import { useUsersStore } from 'src/stores/users';

const authStore = useAuthStore();
const patientsStore = usePatientsStore();
const clientsStore = useClientsStore();
const usersStore = useUsersStore();

const { userName, clientName } = storeToRefs(authStore);

const loadingStats = ref(true);
const stats = reactive({ patients: 0, clients: 0, users: 0 });

onMounted(async () => {
  try {
    await Promise.all([
      patientsStore.fetchAll(),
      clientsStore.fetchAll(),
      usersStore.fetchAll(),
    ]);
    stats.patients = patientsStore.patients.length;
    stats.clients = clientsStore.clients.length;
    stats.users = usersStore.users.length;
  } finally {
    loadingStats.value = false;
  }
});
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}
</style>
