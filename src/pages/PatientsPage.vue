<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-primary">Pacientes</div>
        <div class="text-caption text-grey-6">Gerencie os pacientes cadastrados</div>
      </div>
      <q-btn
        unelevated
        color="primary"
        icon="person_add"
        label="Novo Paciente"
        :to="{ name: 'patient-create' }"
      />
    </div>

    <!-- Filtro de busca -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-py-sm">
        <q-input
          v-model="search"
          dense
          outlined
          placeholder="Buscar por nome, CPF ou cidade..."
          clearable
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <!-- Tabela -->
    <q-card flat bordered>
      <q-table
        :rows="filteredPatients"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :rows-per-page-options="[10, 20, 50]"
        flat
        bordered
        no-data-label="Nenhum paciente encontrado"
        loading-label="Carregando pacientes..."
      >
        <!-- CPF formatado -->
        <template #body-cell-cpf="props">
          <q-td :props="props">
            <span class="text-mono">{{ props.value }}</span>
          </q-td>
        </template>

        <!-- Data de nascimento formatada -->
        <template #body-cell-birthDate="props">
          <q-td :props="props">
            {{ formatDate(props.value) }}
          </q-td>
        </template>

        <!-- Ações -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn
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
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const patientsStore = usePatientsStore();
const { patients, loading } = storeToRefs(patientsStore);

const search = ref('');

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' as const },
  { name: 'name', label: 'Nome', field: 'name', sortable: true, align: 'left' as const },
  { name: 'cpf', label: 'CPF', field: 'cpf', align: 'left' as const },
  { name: 'birthDate', label: 'Nascimento', field: 'birthDate', sortable: true, align: 'left' as const },
  { name: 'cellphone', label: 'Celular', field: 'cellphone', align: 'left' as const },
  { name: 'city', label: 'Cidade', field: 'city', align: 'left' as const },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'right' as const },
];

const filteredPatients = computed(() => {
  if (!search.value) return patients.value;
  const q = search.value.toLowerCase();
  return patients.value.filter(
    (p: Patient) =>
      p.name.toLowerCase().includes(q) ||
      p.cpf?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q),
  );
});

function formatDate(date: string) {
  if (!date) return '-';
  const [year, month, day] = date.split('T')[0]!.split('-') as [string, string, string];
  return `${day}/${month}/${year}`;
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

onMounted(() => patientsStore.fetchAll());
</script>
