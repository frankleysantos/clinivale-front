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
            {{ props.row.client?.name ?? '—' }}
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
              <q-tooltip>Editar</q-tooltip>
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
              <q-tooltip>Excluir</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog criar/editar -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}</div>
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
import { useAuthStore } from 'src/stores/auth';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const authStore = useAuthStore();
const usersStore = useUsersStore();
const rolesStore = useRolesStore();
const { users, loading } = storeToRefs(usersStore);
const { roles: availableRoles } = storeToRefs(rolesStore);

const dialogOpen = ref(false);
const saving = ref(false);
const showPwd = ref(false);
const editingUser = ref<UserItem | null>(null);

const userForm = reactive({
  name: '',
  email: '',
  password: '',
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

async function openDialog(user?: UserItem) {
  editingUser.value = user ?? null;
  userForm.name = user?.name ?? '';
  userForm.email = user?.email ?? '';
  userForm.password = '';
  userForm.role_ids = user?.roles?.map((r) => r.id) || [];
  showPwd.value = false;

  if (availableRoles.value.length === 0) {
    await rolesStore.fetchAll();
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
      });
      $q.notify({ type: 'positive', message: 'Usuário atualizado com sucesso.', position: 'top' });
    } else {
      await usersStore.create({
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role_ids: userForm.role_ids,
      });
      $q.notify({ type: 'positive', message: 'Usuário criado com sucesso.', position: 'top' });
    }
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
    } catch {
      $q.notify({ type: 'negative', message: 'Erro ao excluir usuário.', position: 'top' });
    }
  });
}

onMounted(async () => {
  await Promise.all([
    usersStore.fetchAll(),
    rolesStore.fetchAll(),
  ]);
});
</script>

