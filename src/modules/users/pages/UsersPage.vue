<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-primary">Usuários</div>
        <div class="text-caption text-grey-6">Gerencie os usuários do sistema</div>
      </div>
      <q-btn
        v-if="authStore.hasPermission('UserController', 'create')"
        unelevated
        color="primary"
        icon="person_add"
        label="Novo Usuário"
        @click="openDialog()"
      />
    </div>

    <!-- Filtro por Clínica (Disponível para Clínica Mestre) -->
    <q-card v-if="isMasterClinic" flat bordered class="q-mb-md q-pa-sm">
      <div class="row items-center q-col-gutter-md">
        <div class="col-12 col-md-5 col-lg-4">
          <q-select
            v-model="selectedFilterClient"
            :options="filterClientOptions"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            outlined
            dense
            clearable
            label="Filtrar por Clínica / Estabelecimento"
            @update:model-value="onFilterChange"
          >
            <template #prepend>
              <q-icon name="filter_alt" color="primary" />
            </template>
          </q-select>
        </div>
        <div class="col text-caption text-grey-7">
          <span v-if="selectedFilterClient === 'all'">
            Exibindo usuários de <strong>todas as clínicas</strong> cadastradas.
          </span>
          <span v-else-if="selectedFilterClient">
            Exibindo usuários da clínica selecionada.
          </span>
          <span v-else>
            Exibindo usuários da clínica ativa.
          </span>
        </div>
      </div>
    </q-card>

    <!-- Tabela -->
    <q-card flat bordered>
      <q-table
        :rows="users"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :rows-per-page-options="[10, 20, 50]"
        flat
        no-data-label="Nenhum usuário encontrado"
        loading-label="Carregando usuários..."
      >
        <!-- Roles badges -->
        <template #body-cell-roles="props">
          <q-td :props="props">
            <q-badge
              v-for="role in props.row.roles"
              :key="role.id"
              color="primary"
              class="q-mr-xs"
            >
              {{ role.name }}
            </q-badge>
            <span v-if="!props.row.roles?.length" class="text-grey-5 text-caption">—</span>
          </q-td>
        </template>

        <!-- Cliente -->
        <template #body-cell-client="props">
          <q-td :props="props">
            <q-badge v-if="props.row.client?.name" color="blue-grey" outline>
              {{ props.row.client.name }}
            </q-badge>
            <span v-else class="text-caption text-grey-6">—</span>
          </q-td>
        </template>

        <!-- Ações -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn
              v-if="authStore.hasPermission('UserController', 'update')"
              flat
              dense
              round
              icon="edit"
              color="primary"
              @click="openDialog(props.row)"
            >
              <q-tooltip>Editar usuário</q-tooltip>
            </q-btn>
            <q-btn
              v-if="authStore.hasPermission('UserController', 'remove')"
              flat
              dense
              round
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Excluir usuário</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Criar/Editar Usuário -->
    <q-dialog v-model="dialogOpen" persistent max-width="600px">
      <q-card style="min-width: 480px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 font-weight-bold">
            {{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="saveUser" class="q-gutter-md">
            <q-input
              v-model="userForm.name"
              label="Nome *"
              outlined
              dense
              :rules="[(v) => !!v || 'Nome obrigatório']"
            />
            <q-input
              v-model="userForm.email"
              label="E-mail *"
              type="email"
              outlined
              dense
              :rules="[
                (v) => !!v || 'E-mail obrigatório',
                (v) => /.+@.+\..+/.test(v) || 'E-mail inválido',
              ]"
            />
            <q-input
              v-if="!editingUser"
              v-model="userForm.password"
              label="Senha *"
              :type="showPwd ? 'text' : 'password'"
              outlined
              dense
              :rules="[(v) => !!v || 'Senha obrigatória']"
            >
              <template #append>
                <q-icon
                  :name="showPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPwd = !showPwd"
                />
              </template>
            </q-input>

            <q-select
              v-if="isMasterClinic"
              v-model="userForm.client_id"
              :options="clients"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              outlined
              dense
              clearable
              label="Clínica / Estabelecimento *"
              hint="Selecione o estabelecimento deste usuário"
              :rules="[(v) => !!v || 'Clínica obrigatória']"
              @update:model-value="onClientChange"
            />

            <q-select
              v-model="userForm.role_ids"
              :options="availableRoles"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              multiple
              use-chips
              outlined
              dense
              label="Perfis / Roles *"
              hint="Selecione os perfis do usuário nesta clínica"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn
                unelevated
                type="submit"
                :label="editingUser ? 'Salvar' : 'Criar'"
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
import { reactive, ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useUsersStore, type UserItem } from 'src/stores/users';
import { useRolesStore } from 'src/stores/roles';
import { useClientsStore } from 'src/stores/clients';
import { useAuthStore } from 'src/stores/auth';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const authStore = useAuthStore();
const usersStore = useUsersStore();
const rolesStore = useRolesStore();
const clientsStore = useClientsStore();
const { users, loading } = storeToRefs(usersStore);
const { roles: availableRoles } = storeToRefs(rolesStore);
const { clients } = storeToRefs(clientsStore);

const isMasterClinic = computed(() => {
  const currentClient = authStore.user?.client;
  return Number(currentClient?.id) === 1 || currentClient?.name?.toLowerCase() === 'clinivale';
});

const selectedFilterClient = ref<number | string | null>('all');

const filterClientOptions = computed(() => {
  return [
    { id: 'all', name: 'Todas as Clínicas' },
    ...clients.value.map((c) => ({ id: c.id, name: c.name })),
  ];
});

const dialogOpen = ref(false);
const saving = ref(false);
const showPwd = ref(false);
const editingUser = ref<UserItem | null>(null);

const userForm = reactive({
  name: '',
  email: '',
  password: '',
  client_id: null as number | null,
  role_ids: [] as number[],
});

const columns = computed(() => {
  const cols = [
    { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' as const },
    { name: 'name', label: 'Nome', field: 'name', sortable: true, align: 'left' as const },
    { name: 'email', label: 'E-mail', field: 'email', align: 'left' as const },
    { name: 'client', label: 'Estabelecimento', field: 'client', align: 'left' as const },
    { name: 'roles', label: 'Perfis', field: 'roles', align: 'left' as const },
  ];

  if (authStore.hasPermission('UserController', 'update') || authStore.hasPermission('UserController', 'remove')) {
    cols.push({ name: 'actions', label: 'Ações', field: 'actions', align: 'right' as const });
  }

  return cols;
});

async function onFilterChange(val: number | string | null) {
  if (val === 'all') {
    await usersStore.fetchAll('all');
  } else if (val) {
    await usersStore.fetchAll(val);
  } else {
    await usersStore.fetchAll();
  }
}

async function reloadCurrentUsers() {
  if (isMasterClinic.value) {
    await onFilterChange(selectedFilterClient.value);
  } else {
    await usersStore.fetchAll();
  }
}

async function onClientChange(clientId: number | null) {
  // Limpa as roles selecionadas quando a clínica muda para não manter perfis de outro cliente
  userForm.role_ids = [];
  const targetId = clientId || authStore.user?.client?.id;
  await rolesStore.fetchAll(targetId);
}

async function openDialog(user?: UserItem) {
  editingUser.value = user ?? null;
  userForm.name = user?.name ?? '';
  userForm.email = user?.email ?? '';
  userForm.password = '';
  userForm.client_id = user?.client?.id ?? authStore.user?.client?.id ?? null;
  userForm.role_ids = user?.roles?.map((r) => r.id) || [];
  showPwd.value = false;

  const targetClientId = userForm.client_id || authStore.user?.client?.id;
  await rolesStore.fetchAll(targetClientId);

  if (isMasterClinic.value && clients.value.length === 0) {
    await clientsStore.fetchAll();
  }

  dialogOpen.value = true;
}

async function saveUser() {
  saving.value = true;
  try {
    if (editingUser.value) {
      await usersStore.update(editingUser.value.id, {
        name: userForm.name,
        email: userForm.email,
        role_ids: userForm.role_ids,
        ...(userForm.client_id ? { client_id: userForm.client_id } : {}),
      });
      $q.notify({ type: 'positive', message: 'Usuário atualizado com sucesso.', position: 'top' });
    } else {
      await usersStore.create({
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role_ids: userForm.role_ids,
        ...(userForm.client_id ? { client_id: userForm.client_id } : {}),
      });
      $q.notify({ type: 'positive', message: 'Usuário criado com sucesso.', position: 'top' });
    }
    await reloadCurrentUsers();
    dialogOpen.value = false;
  } catch (error: any) {
    const msg = error?.response?.data?.message || 'Erro ao salvar usuário.';
    $q.notify({ type: 'negative', message: msg, position: 'top' });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(user: UserItem) {
  $q.dialog({
    title: 'Excluir usuário',
    message: `Deseja realmente excluir <strong>${user.name}</strong>?`,
    html: true,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await usersStore.remove(user.id);
      $q.notify({ type: 'positive', message: 'Usuário excluído.', position: 'top' });
      await reloadCurrentUsers();
    } catch {
      $q.notify({ type: 'negative', message: 'Erro ao excluir usuário.', position: 'top' });
    }
  });
}

onMounted(async () => {
  if (isMasterClinic.value) {
    await clientsStore.fetchAll();
    await usersStore.fetchAll('all');
  } else {
    await usersStore.fetchAll();
  }
  await rolesStore.fetchAll();
});
</script>
