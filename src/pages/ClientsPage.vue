<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-primary">Clientes</div>
        <div class="text-caption text-grey-6">Gerencie os estabelecimentos/clientes</div>
      </div>
      <q-btn
        unelevated
        color="primary"
        icon="add_business"
        label="Novo Cliente"
        @click="openDialog()"
      />
    </div>

    <!-- Tabela -->
    <q-card flat bordered>
      <q-table
        :rows="clients"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :rows-per-page-options="[10, 20, 50]"
        flat
        no-data-label="Nenhum cliente encontrado"
        loading-label="Carregando clientes..."
      >
        <!-- Tipo badge -->
        <template #body-cell-type="props">
          <q-td :props="props">
            <q-badge :color="props.value === 'JURIDICA' ? 'blue-grey' : 'teal'">
              {{ props.value === 'JURIDICA' ? 'Jurídica' : 'Física' }}
            </q-badge>
          </q-td>
        </template>

        <!-- Status badge -->
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.value === 'ATIVO' ? 'positive' : 'negative'">
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <!-- Documento (CPF ou CNPJ) -->
        <template #body-cell-documento="props">
          <q-td :props="props">
            <span class="text-mono">
              {{ props.row.cnpj || props.row.cpf || '—' }}
            </span>
          </q-td>
        </template>

        <!-- Ações -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn flat dense round icon="edit" color="primary" @click="openDialog(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat dense round icon="delete" color="negative" @click="confirmDelete(props.row)">
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog criar/editar -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 480px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingClient ? 'Editar Cliente' : 'Novo Cliente' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="saveClient" class="q-gutter-md">
            <q-input
              v-model="clientForm.name"
              label="Nome / Razão Social *"
              outlined
              dense
              :rules="[(v) => !!v || 'Nome obrigatório']"
            />

            <q-select
              v-model="clientForm.type"
              :options="typeOptions"
              label="Tipo *"
              outlined
              dense
              emit-value
              map-options
              :rules="[(v) => !!v || 'Tipo obrigatório']"
            />

            <q-input
              v-if="clientForm.type === 'FISICA'"
              v-model="clientForm.cpf"
              label="CPF"
              outlined
              dense
              mask="###.###.###-##"
            />
            <q-input
              v-if="clientForm.type === 'JURIDICA'"
              v-model="clientForm.cnpj"
              label="CNPJ"
              outlined
              dense
              mask="##.###.###/####-##"
            />

            <div class="row q-gutter-md">
              <div class="col">
                <q-input v-model="clientForm.cellphone" label="Telefone" outlined dense mask="(##) #####-####" />
              </div>
              <div class="col">
                <q-input v-model="clientForm.email" label="E-mail" outlined dense />
              </div>
            </div>

            <div class="row q-gutter-md">
              <div class="col">
                <q-input v-model="clientForm.city" label="Cidade" outlined dense />
              </div>
              <div class="col-3">
                <q-input v-model="clientForm.state" label="UF" outlined dense maxlength="2" />
              </div>
            </div>

            <q-select
              v-model="clientForm.status"
              :options="statusOptions"
              label="Status"
              outlined
              dense
              emit-value
              map-options
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn
                unelevated
                type="submit"
                :label="editingClient ? 'Salvar' : 'Criar'"
                color="primary"
                :loading="saving"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useClientsStore, type Client, type CreateClientDto } from 'src/stores/clients';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const clientsStore = useClientsStore();
const { clients, loading } = storeToRefs(clientsStore);

const dialogOpen = ref(false);
const saving = ref(false);
const editingClient = ref<Client | null>(null);

const typeOptions = [
  { label: 'Pessoa Física', value: 'FISICA' },
  { label: 'Pessoa Jurídica', value: 'JURIDICA' },
];

const statusOptions = [
  { label: 'Ativo', value: 'ATIVO' },
  { label: 'Inativo', value: 'INATIVO' },
];

const clientForm = reactive<CreateClientDto & { cpf?: string; cnpj?: string }>({
  name: '',
  type: 'FISICA',
  cpf: '',
  cnpj: '',
  cellphone: '',
  email: '',
  city: '',
  state: '',
  status: 'ATIVO',
});

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' as const },
  { name: 'name', label: 'Nome', field: 'name', sortable: true, align: 'left' as const },
  { name: 'documento', label: 'CPF/CNPJ', field: 'documento', align: 'left' as const },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left' as const },
  { name: 'city', label: 'Cidade', field: 'city', align: 'left' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'right' as const },
];

function openDialog(client?: Client) {
  editingClient.value = client ?? null;
  clientForm.name = client?.name ?? '';
  clientForm.type = client?.type ?? 'FISICA';
  clientForm.cpf = client?.cpf ?? '';
  clientForm.cnpj = client?.cnpj ?? '';
  clientForm.cellphone = client?.cellphone ?? '';
  clientForm.email = client?.email ?? '';
  clientForm.city = client?.city ?? '';
  clientForm.state = client?.state ?? '';
  clientForm.status = client?.status ?? 'ATIVO';
  dialogOpen.value = true;
}

async function saveClient() {
  saving.value = true;
  try {
    const payload: CreateClientDto = {
      name: clientForm.name,
      type: clientForm.type,
      ...(clientForm.cellphone ? { cellphone: clientForm.cellphone } : {}),
      ...(clientForm.email ? { email: clientForm.email } : {}),
      ...(clientForm.city ? { city: clientForm.city } : {}),
      ...(clientForm.state ? { state: clientForm.state } : {}),
      ...(clientForm.status ? { status: clientForm.status } : {}),
      ...(clientForm.type === 'FISICA' && clientForm.cpf
        ? { cpf: clientForm.cpf.replace(/\D/g, '') }
        : {}),
      ...(clientForm.type === 'JURIDICA' && clientForm.cnpj
        ? { cnpj: clientForm.cnpj.replace(/\D/g, '') }
        : {}),
    };

    if (editingClient.value) {
      await clientsStore.update(editingClient.value.id, payload);
      $q.notify({ type: 'positive', message: 'Cliente atualizado.', position: 'top' });
    } else {
      await clientsStore.create(payload);
      $q.notify({ type: 'positive', message: 'Cliente criado com sucesso.', position: 'top' });
    }
    dialogOpen.value = false;
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar cliente.', position: 'top' });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(client: Client) {
  $q.dialog({
    title: 'Excluir cliente',
    message: `Deseja realmente excluir <strong>${client.name}</strong>?`,
    html: true,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await clientsStore.remove(client.id);
      $q.notify({ type: 'positive', message: 'Cliente excluído.', position: 'top' });
    } catch {
      $q.notify({ type: 'negative', message: 'Erro ao excluir cliente.', position: 'top' });
    }
  });
}

onMounted(() => clientsStore.fetchAll());
</script>
