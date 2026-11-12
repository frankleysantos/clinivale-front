<template>
  <q-page padding class="responsive-page">
    <!-- Header da Página -->
    <div class="row items-center justify-between q-mb-md q-mb-sm-lg gap-sm">
      <div>
        <div class="text-h5 text-weight-bolder text-dark">Pacientes</div>
        <div class="text-caption text-grey-7">Gerencie os prontuários e fichas clínicas</div>
      </div>
      <q-btn
        v-if="authStore.hasPermission('PatientController', 'create')"
        unelevated
        color="primary"
        icon="add"
        label="Novo Paciente"
        class="picpay-action-btn lt-sm-full"
        :to="{ name: 'patient-create' }"
      />
    </div>

    <!-- Barra de Busca PicPay -->
    <div class="q-mb-md">
      <q-input
        v-model="search"
        dense
        outlined
        placeholder="Buscar por nome, CPF ou cidade..."
        clearable
        class="picpay-search-input"
      >
        <template #prepend>
          <q-icon name="search" color="grey-6" />
        </template>
      </q-input>
    </div>

    <!-- Tabela Híbrida: Tabela no Desktop / Cards estilo PicPay no Mobile -->
    <q-card flat bordered class="table-card">
      <q-table
        :rows="filteredPatients"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :grid="$q.screen.lt.sm"
        :rows-per-page-options="[10, 20, 50]"
        flat
        no-data-label="Nenhum paciente cadastrado"
        loading-label="Carregando pacientes..."
        class="responsive-table"
      >
        <!-- Layout do Card Mobile estilo PicPay -->
        <template #item="props">
          <div class="col-12 q-pa-xs">
            <q-card flat class="mobile-item-card q-pa-md">
              <div class="row items-center justify-between no-wrap q-mb-xs">
                <div class="row items-center no-wrap ellipsis">
                  <div class="patient-avatar q-mr-sm">
                    <q-icon name="person" size="18px" color="primary" />
                  </div>
                  <div class="text-weight-bold text-dark ellipsis text-subtitle2">
                    {{ props.row.name }}
                  </div>
                </div>
                <div class="row items-center no-wrap q-gutter-xs">
                  <q-btn
                    v-if="authStore.hasPermission('PatientController', 'update')"
                    flat
                    dense
                    round
                    icon="edit"
                    color="primary"
                    size="sm"
                    :to="{ name: 'patient-edit', params: { id: props.row.id } }"
                  />
                  <q-btn
                    v-if="authStore.hasPermission('PatientController', 'remove')"
                    flat
                    dense
                    round
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click="confirmDelete(props.row)"
                  />
                </div>
              </div>

              <q-separator class="q-my-xs opacity-40" />

              <div class="row q-col-gutter-xs text-caption q-mt-xs">
                <div class="col-6 text-grey-7">
                  <span class="text-weight-bold">CPF:</span> {{ props.row.cpf || '—' }}
                </div>
                <div class="col-6 text-grey-7">
                  <span class="text-weight-bold">Tel:</span> {{ props.row.cellphone || '—' }}
                </div>
                <div class="col-6 text-grey-7">
                  <span class="text-weight-bold">Cidade:</span> {{ props.row.city || '—' }}
                </div>
                <div class="col-6 text-grey-7">
                  <span class="text-weight-bold">Nasc:</span> {{ formatDate(props.row.birthDate) }}
                </div>
              </div>

              <div class="q-mt-sm row justify-end">
                <q-btn
                  flat
                  dense
                  rounded
                  size="sm"
                  color="teal"
                  icon="medical_information"
                  label="Prontuário (PEP)"
                  :to="{ name: 'patient-record', params: { id: props.row.id } }"
                />
              </div>
            </q-card>
          </div>
        </template>

        <!-- Template Desktop das Células -->
        <template #body-cell-cpf="props">
          <q-td :props="props">
            <span class="text-mono">{{ props.value || '—' }}</span>
          </q-td>
        </template>

        <template #body-cell-birthDate="props">
          <q-td :props="props">
            {{ formatDate(props.value) }}
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right no-wrap">
            <q-btn
              flat
              dense
              round
              icon="medical_information"
              color="teal"
              :to="{ name: 'patient-record', params: { id: props.row.id } }"
            >
              <q-tooltip>Abrir Prontuário Eletrônico (PEP)</q-tooltip>
            </q-btn>
            <q-btn
              v-if="authStore.hasPermission('PatientController', 'update')"
              flat
              dense
              round
              icon="edit"
              color="primary"
              :to="{ name: 'patient-edit', params: { id: props.row.id } }"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              v-if="authStore.hasPermission('PatientController', 'remove')"
              flat
              dense
              round
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { usePatientsStore, type Patient } from 'src/stores/patients';
import { useAuthStore } from 'src/stores/auth';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const authStore = useAuthStore();
const patientsStore = usePatientsStore();
const { patients, loading } = storeToRefs(patientsStore);

const search = ref('');

const columns = computed(() => {
  const cols = [
    { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' as const },
    { name: 'name', label: 'Nome', field: 'name', sortable: true, align: 'left' as const },
    { name: 'cpf', label: 'CPF', field: 'cpf', align: 'left' as const },
    { name: 'cellphone', label: 'Telefone', field: 'cellphone', align: 'left' as const },
    { name: 'city', label: 'Cidade', field: 'city', align: 'left' as const },
    { name: 'birthDate', label: 'Nascimento', field: 'birthDate', align: 'left' as const },
  ];

  if (authStore.hasPermission('PatientController', 'update') || authStore.hasPermission('PatientController', 'remove')) {
    cols.push({ name: 'actions', label: 'Ações', field: 'actions', align: 'right' as const });
  }

  return cols;
});

const filteredPatients = computed(() => {
  if (!search.value) return patients.value;
  const q = search.value.toLowerCase();
  return patients.value.filter(
    (p) =>
      p.name?.toLowerCase().includes(q) ||
      p.cpf?.includes(q) ||
      p.city?.toLowerCase().includes(q),
  );
});

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

function confirmDelete(patient: Patient) {
  $q.dialog({
    title: 'Excluir paciente',
    message: `Deseja realmente excluir <strong>${patient.name}</strong>?`,
    html: true,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await patientsStore.remove(patient.id);
      $q.notify({ type: 'positive', message: 'Paciente excluído com sucesso.', position: 'top' });
    } catch {
      $q.notify({ type: 'negative', message: 'Erro ao excluir paciente.', position: 'top' });
    }
  });
}

onMounted(() => {
  patientsStore.fetchAll();
});
</script>

<style scoped lang="scss">
.responsive-page {
  max-width: 1400px;
  margin: 0 auto;
}

.picpay-action-btn {
  border-radius: 999px;
  font-weight: 700;
  padding: 8px 18px;
}

.mobile-item-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  background: #FFFFFF;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
}

.patient-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(17, 199, 111, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 600px) {
  .lt-sm-full {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
