<template>
  <q-page padding class="responsive-page">
    <div class="row items-center justify-between q-mb-md q-mb-sm-lg gap-sm">
      <div>
        <div class="text-h5 text-weight-bolder text-dark">Clientes</div>
        <div class="text-caption text-grey-7">Gerencie estabelecimentos e parceiros</div>
      </div>
      <q-btn
        v-if="authStore.hasPermission('ClientController', 'create')"
        unelevated
        color="primary"
        icon="add"
        label="Novo Cliente"
        class="picpay-action-btn lt-sm-full"
        @click="openDialog()"
      />
    </div>

    <!-- Tabela Híbrida: Desktop Tabela / Mobile Cards PicPay -->
    <q-card flat bordered class="table-card">
      <q-table
        :rows="clients"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :grid="$q.screen.lt.sm"
        :rows-per-page-options="[10, 20, 50]"
        flat
        no-data-label="Nenhum cliente encontrado"
        loading-label="Carregando clientes..."
        class="responsive-table"
      >
        <!-- Card Mobile estilo PicPay -->
        <template #item="props">
          <div class="col-12 q-pa-xs">
            <q-card flat class="mobile-item-card q-pa-md">
              <div class="row items-center justify-between no-wrap q-mb-xs">
                <div class="row items-center no-wrap ellipsis">
                  <div class="client-avatar q-mr-sm">
                    <q-icon name="apartment" size="18px" color="primary" />
                  </div>
                  <div class="text-weight-bold text-dark ellipsis text-subtitle2">
                    {{ props.row.name }}
                  </div>
                </div>
                <div class="row items-center no-wrap q-gutter-xs">
                  <q-badge :color="props.row.status === 'ATIVO' ? 'positive' : 'negative'" class="q-mr-xs">
                    {{ props.row.status }}
                  </q-badge>
                  <q-btn
                    v-if="authStore.hasPermission('ClientController', 'update')"
                    flat
                    dense
                    round
                    icon="edit"
                    color="primary"
                    size="sm"
                    @click="openDialog(props.row)"
                  />
                  <q-btn
                    v-if="authStore.hasPermission('ClientController', 'remove')"
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
                  <span class="text-weight-bold">Tipo:</span> {{ props.row.type }}
                </div>
                <div class="col-6 text-grey-7">
                  <span class="text-weight-bold">Doc:</span> {{ props.row.cnpj || props.row.cpf || '—' }}
                </div>
                <div class="col-6 text-grey-7">
                  <span class="text-weight-bold">Contato:</span> {{ props.row.cellphone || '—' }}
                </div>
                <div class="col-6 text-grey-7">
                  <span class="text-weight-bold">Cidade:</span> {{ [props.row.city, props.row.state].filter(Boolean).join('/') || '—' }}
                </div>
              </div>
            </q-card>
          </div>
        </template>

        <!-- Template Desktop -->
        <template #body-cell-type="props">
          <q-td :props="props">
            <q-badge :color="props.value === 'JURIDICA' ? 'dark' : 'primary'">
              {{ props.value === 'JURIDICA' ? 'Jurídica' : 'Física' }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.value === 'ATIVO' ? 'positive' : 'negative'">
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-documento="props">
          <q-td :props="props">
            <span class="text-mono">
              {{ props.row.cnpj || props.row.cpf || '—' }}
            </span>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right no-wrap">
            <q-btn
              v-if="authStore.hasPermission('ClientController', 'update')"
              flat
              dense
              round
              icon="edit"
              color="primary"
              @click="openDialog(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              v-if="authStore.hasPermission('ClientController', 'remove')"
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

    <!-- Dialog Criar/Editar Cliente com visual Bottom Sheet no mobile -->
    <q-dialog v-model="dialogOpen" persistent max-width="600px">
      <q-card style="min-width: 320px; width: 600px" class="q-pa-xs">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bolder text-dark">
            {{ editingClient ? 'Editar Cliente' : 'Novo Cliente' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="saveClient" class="q-gutter-md">
            <q-input
              v-model="clientForm.name"
              label="Nome / Razão Social *"
              outlined
              dense
              :rules="[(v) => !!v || 'Nome obrigatório']"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="clientForm.type"
                  :options="['FISICA', 'JURIDICA']"
                  label="Tipo de Pessoa *"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-if="clientForm.type === 'FISICA'"
                  v-model="clientForm.cpf"
                  label="CPF"
                  outlined
                  dense
                  mask="###.###.###-##"
                />
                <q-input
                  v-else
                  v-model="clientForm.cnpj"
                  label="CNPJ"
                  outlined
                  dense
                  mask="##.###.###/####-##"
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="clientForm.cellphone"
                  label="Telefone / WhatsApp"
                  outlined
                  dense
                  mask="(##) #####-####"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="clientForm.email"
                  label="E-mail"
                  type="email"
                  outlined
                  dense
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="clientForm.city"
                  label="Cidade"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="clientForm.state"
                  label="UF"
                  outlined
                  dense
                  maxlength="2"
                />
              </div>
            </div>

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
              <q-btn
                unelevated
                type="submit"
                :label="editingClient ? 'Salvar Alterações' : 'Cadastrar'"
                color="primary"
                :loading="saving"
                class="picpay-action-btn"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useClientsStore, type Client, type ClientType } from 'src/stores/clients';
import { useAuthStore } from 'src/stores/auth';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const authStore = useAuthStore();
const clientsStore = useClientsStore();
const { clients, loading } = storeToRefs(clientsStore);

const dialogOpen = ref(false);
const saving = ref(false);
const editingClient = ref<Client | null>(null);

const clientForm = reactive({
  name: '',
  cpf: '',
  cnpj: '',
  type: 'FISICA' as ClientType,
  cellphone: '',
  email: '',
  city: '',
  state: '',
});

const columns = computed(() => {
  const cols = [
    { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' as const },
    { name: 'name', label: 'Nome / Razão', field: 'name', sortable: true, align: 'left' as const },
    { name: 'type', label: 'Tipo', field: 'type', align: 'left' as const },
    { name: 'documento', label: 'Documento', field: 'documento', align: 'left' as const },
    { name: 'cellphone', label: 'Contato', field: 'cellphone', align: 'left' as const },
    { name: 'city', label: 'Cidade/UF', field: (row: Client) => [row.city, row.state].filter(Boolean).join('/') || '—', align: 'left' as const },
    { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
  ];

  if (authStore.hasPermission('ClientController', 'update') || authStore.hasPermission('ClientController', 'remove')) {
    cols.push({ name: 'actions', label: 'Ações', field: 'actions', align: 'right' as const });
  }

  return cols;
});

function openDialog(client?: Client) {
  editingClient.value = client ?? null;
  clientForm.name = client?.name ?? '';
  clientForm.cpf = client?.cpf ?? '';
  clientForm.cnpj = client?.cnpj ?? '';
  clientForm.type = client?.type ?? 'FISICA';
  clientForm.cellphone = client?.cellphone ?? '';
  clientForm.email = client?.email ?? '';
  clientForm.city = client?.city ?? '';
  clientForm.state = client?.state ?? '';
  dialogOpen.value = true;
}

async function saveClient() {
  saving.value = true;
  try {
    const payload = {
      name: clientForm.name,
      type: clientForm.type,
      cpf: clientForm.type === 'FISICA' ? clientForm.cpf : undefined,
      cnpj: clientForm.type === 'JURIDICA' ? clientForm.cnpj : undefined,
      cellphone: clientForm.cellphone || undefined,
      email: clientForm.email || undefined,
      city: clientForm.city || undefined,
      state: clientForm.state || undefined,
    };

    if (editingClient.value) {
      await clientsStore.update(editingClient.value.id, payload);
      $q.notify({ type: 'positive', message: 'Cliente atualizado.', position: 'top' });
    } else {
      await clientsStore.create(payload);
      $q.notify({ type: 'positive', message: 'Cliente cadastrado.', position: 'top' });
    }
    dialogOpen.value = false;
  } catch (error: any) {
    const msg = error?.response?.data?.message || 'Erro ao salvar cliente.';
    $q.notify({ type: 'negative', message: msg, position: 'top' });
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

onMounted(() => {
  clientsStore.fetchAll();
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

.client-avatar {
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
