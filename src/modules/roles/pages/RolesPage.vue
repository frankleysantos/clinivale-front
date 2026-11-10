<template>
  <q-page padding class="responsive-page">
    <div class="row items-center justify-between q-mb-md q-mb-sm-lg gap-sm">
      <div>
        <div class="text-h5 text-weight-bolder text-dark">Perfis e Permissões</div>
        <div class="text-caption text-grey-7">Crie e gerencie as roles do sistema com regras de acesso</div>
      </div>
      <q-btn
        v-if="canCreateRole"
        unelevated
        color="primary"
        icon="add"
        label="Novo Perfil"
        class="picpay-action-btn lt-sm-full"
        @click="openDialog()"
      />
    </div>

    <!-- Filtro por Clínica (Disponível para Clínica Mestre) -->
    <q-card v-if="isMasterClinic" flat bordered class="q-mb-md q-pa-sm filter-card">
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
            label="Filtrar por Estabelecimento"
            @update:model-value="onFilterChange"
          >
            <template #prepend>
              <q-icon name="filter_alt" color="primary" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-7 text-caption text-grey-7">
          <span v-if="selectedFilterClient === 'all'">
            Exibindo perfis de <strong>todas as clínicas</strong> cadastradas.
          </span>
          <span v-else-if="selectedFilterClient">
            Exibindo perfis da clínica selecionada.
          </span>
          <span v-else>
            Exibindo perfis da clínica ativa.
          </span>
        </div>
      </div>
    </q-card>

    <!-- Tabela Híbrida de Roles: Desktop Tabela / Mobile Cards PicPay -->
    <q-card flat bordered class="table-card q-mb-md">
      <q-table
        :rows="roles"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :grid="$q.screen.lt.sm"
        :rows-per-page-options="[10, 20, 50]"
        flat
        no-data-label="Nenhum perfil cadastrado"
        loading-label="Carregando perfis..."
        class="responsive-table"
      >
        <!-- Card Mobile PicPay -->
        <template #item="props">
          <div class="col-12 q-pa-xs">
            <q-card flat class="mobile-item-card q-pa-md">
              <div class="row items-center justify-between no-wrap q-mb-xs">
                <div class="row items-center no-wrap ellipsis">
                  <div class="role-avatar q-mr-sm">
                    <q-icon name="verified_user" size="18px" color="primary" />
                  </div>
                  <div class="text-weight-bold text-dark ellipsis text-subtitle2">
                    {{ props.row.name }}
                  </div>
                </div>
                <div class="row items-center no-wrap q-gutter-xs">
                  <q-btn
                    v-if="authStore.hasPermission('RolesController', 'updateRole')"
                    flat
                    dense
                    round
                    icon="edit"
                    color="primary"
                    size="sm"
                    @click="openDialog(props.row)"
                  />
                  <q-btn
                    v-if="authStore.hasPermission('RolesController', 'removeRole')"
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

              <div class="row items-center justify-between q-mt-sm">
                <q-badge v-if="props.row.client?.name" color="grey-3" text-color="dark">
                  {{ props.row.client.name }}
                </q-badge>
                <q-badge v-else color="grey-3" text-color="dark">
                  Global
                </q-badge>
                <q-badge color="primary">
                  {{ props.row.permissions?.length || 0 }} regras
                </q-badge>
              </div>

              <div class="text-caption text-grey-6 q-mt-xs ellipsis">
                {{ formatPermissionsPreview(props.row.permissions) }}
              </div>
            </q-card>
          </div>
        </template>

        <!-- Template Desktop -->
        <template #body-cell-client="props">
          <q-td :props="props">
            <q-badge v-if="props.row.client?.name" color="grey-2" text-color="dark" class="text-weight-bold">
              {{ props.row.client.name }}
            </q-badge>
            <span v-else class="text-caption text-grey-6">Global / Padrão</span>
          </q-td>
        </template>

        <template #body-cell-permissions="props">
          <q-td :props="props">
            <div class="row items-center gap-1">
              <q-badge color="primary" class="q-mr-xs">
                {{ props.row.permissions?.length || 0 }} regras
              </q-badge>
              <span class="text-caption text-grey-7">
                {{ formatPermissionsPreview(props.row.permissions) }}
              </span>
            </div>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right no-wrap">
            <q-btn
              v-if="authStore.hasPermission('RolesController', 'updateRole')"
              flat
              dense
              round
              icon="edit"
              color="primary"
              @click="openDialog(props.row)"
            >
              <q-tooltip>Editar Perfil</q-tooltip>
            </q-btn>
            <q-btn
              v-if="authStore.hasPermission('RolesController', 'removeRole')"
              flat
              dense
              round
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Excluir Perfil</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Criar/Editar Role com visual Bottom Sheet no mobile -->
    <q-dialog v-model="dialogOpen" persistent max-width="700px">
      <q-card style="width: 100%; max-width: 700px" class="q-pa-xs">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bolder text-dark">
            {{ editingRole ? 'Editar Perfil' : 'Novo Perfil de Acesso' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="saveRole" class="q-gutter-md">
            <q-input
              v-model="roleForm.name"
              label="Nome do Perfil *"
              placeholder="Ex: FARMACEUTICO, ATENDENTE, GERENTE"
              outlined
              dense
              :rules="[(v) => !!v || 'Nome do perfil é obrigatório']"
            />

            <!-- Seletor de Clínica se for Clínica Mestre e tiver permissão de criar role -->
            <q-select
              v-if="isMasterClinic && canCreateRole"
              v-model="roleForm.client_id"
              :options="clients"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              outlined
              dense
              clearable
              label="Clínica / Estabelecimento de Destino *"
              hint="Como Clínica Mestre, selecione para qual clínica este perfil será criado"
              :rules="[(v) => !!v || 'Selecione a clínica para vincular este perfil']"
            />

            <!-- Seção de Permissões -->
            <div class="q-mt-sm">
              <div class="row items-center justify-between q-mb-sm">
                <span class="text-subtitle2 text-weight-bold text-dark">
                  Regras de Acesso por Módulo
                </span>
                <div class="q-gutter-xs">
                  <q-btn flat dense size="sm" color="primary" label="Marcar Todas" @click="selectAllPermissions" />
                  <q-btn flat dense size="sm" color="grey-7" label="Desmarcar Todas" @click="clearAllPermissions" />
                </div>
              </div>

              <q-list bordered separator class="rounded-borders bg-grey-1" style="max-height: 50vh; overflow-y: auto">
                <q-expansion-item
                  v-for="group in availablePermissions"
                  :key="group.controller"
                  default-opened
                  header-class="bg-grey-2 text-weight-bold"
                >
                  <template #header>
                    <q-item-section avatar>
                      <q-icon name="security" color="primary" size="20px" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{ group.label }}</q-item-label>
                      <q-item-label caption>
                        {{ getGroupSelectedCount(group.controller) }} de {{ group.methods.length }} selecionadas
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-checkbox
                        :model-value="isGroupAllSelected(group)"
                        :indeterminate="isGroupIndeterminate(group)"
                        dense
                        @update:model-value="toggleGroupPermissions(group, $event)"
                      >
                        <q-tooltip>Marcar/Desmarcar todas do módulo {{ group.label }}</q-tooltip>
                      </q-checkbox>
                    </q-item-section>
                  </template>

                  <q-card class="bg-white q-pa-sm">
                    <div class="row q-col-gutter-sm">
                      <div
                        v-for="method in group.methods"
                        :key="method.name"
                        class="col-12 col-sm-6"
                      >
                        <q-checkbox
                          :model-value="!!selectedPermissionsMap[`${group.controller}:${method.name}`]"
                          :label="method.label"
                          dense
                          @update:model-value="selectedPermissionsMap[`${group.controller}:${method.name}`] = !!$event"
                        />
                      </div>
                    </div>
                  </q-card>
                </q-expansion-item>
              </q-list>
            </div>

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
              <q-btn
                unelevated
                type="submit"
                :label="editingRole ? 'Salvar Alterações' : 'Criar Perfil'"
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
import { useRolesStore, type RoleItem, type AvailablePermissionGroup, type PermissionRule } from 'src/stores/roles';
import { useClientsStore } from 'src/stores/clients';
import { useAuthStore } from 'src/stores/auth';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const authStore = useAuthStore();
const rolesStore = useRolesStore();
const clientsStore = useClientsStore();
const { roles, availablePermissions, loading } = storeToRefs(rolesStore);
const { clients } = storeToRefs(clientsStore);

const isMasterClinic = computed(() => {
  const currentClient = authStore.user?.client;
  return Number(currentClient?.id) === 1 || currentClient?.name?.toLowerCase() === 'clinivale';
});

const canCreateRole = computed(() => {
  return authStore.hasPermission('RolesController', 'createRoles');
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
const editingRole = ref<RoleItem | null>(null);

const roleForm = reactive({
  name: '',
  client_id: null as number | null,
});

const selectedPermissionsMap = reactive<Record<string, boolean>>({});

const columns = computed(() => {
  const cols = [
    { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' as const },
    { name: 'name', label: 'Nome do Perfil', field: 'name', sortable: true, align: 'left' as const },
    { name: 'client', label: 'Clínica / Estabelecimento', field: 'client', align: 'left' as const },
    { name: 'permissions', label: 'Regras de Permissão', field: 'permissions', align: 'left' as const },
  ];

  if (authStore.hasPermission('RolesController', 'updateRole') || authStore.hasPermission('RolesController', 'removeRole')) {
    cols.push({ name: 'actions', label: 'Ações', field: 'actions', align: 'right' as const });
  }

  return cols;
});

function formatPermissionsPreview(permissions?: PermissionRule[]): string {
  if (!permissions || permissions.length === 0) return 'Sem regras especificadas';
  const controllers = Array.from(new Set(permissions.map((p) => p.controller)));
  return `Módulos: ${controllers.join(', ')}`;
}

async function onFilterChange(val: number | string | null) {
  if (val === 'all') {
    await rolesStore.fetchAll('all');
  } else if (val) {
    await rolesStore.fetchAll(val);
  } else {
    await rolesStore.fetchAll();
  }
}

async function openDialog(role?: RoleItem) {
  editingRole.value = role ?? null;
  roleForm.name = role?.name ?? '';
  roleForm.client_id = role?.client_id ?? role?.client?.id ?? authStore.user?.client?.id ?? null;

  if (isMasterClinic.value && clients.value.length === 0) {
    await clientsStore.fetchAll();
  }

  // Limpar mapa e inicializar todas as chaves como false
  Object.keys(selectedPermissionsMap).forEach((key) => {
    delete selectedPermissionsMap[key];
  });

  if (availablePermissions.value.length === 0) {
    await rolesStore.fetchAvailablePermissions();
  }

  // Inicializa explicitamente como false para todas as permissões disponíveis
  availablePermissions.value.forEach((group) => {
    group.methods.forEach((method) => {
      selectedPermissionsMap[`${group.controller}:${method.name}`] = false;
    });
  });

  if (role && role.permissions) {
    role.permissions.forEach((p) => {
      selectedPermissionsMap[`${p.controller}:${p.method}`] = true;
    });
  }

  dialogOpen.value = true;
}

function getGroupSelectedCount(controller: string): number {
  const group = availablePermissions.value.find((g) => g.controller === controller);
  if (!group) return 0;
  return group.methods.filter((m) => !!selectedPermissionsMap[`${controller}:${m.name}`]).length;
}

function isGroupAllSelected(group: AvailablePermissionGroup): boolean {
  if (!group.methods.length) return false;
  return group.methods.every((m) => !!selectedPermissionsMap[`${group.controller}:${m.name}`]);
}

function isGroupIndeterminate(group: AvailablePermissionGroup): boolean {
  const count = getGroupSelectedCount(group.controller);
  return count > 0 && count < group.methods.length;
}

function toggleGroupPermissions(group: AvailablePermissionGroup, val: boolean | null) {
  const shouldCheck = !!val;
  group.methods.forEach((m) => {
    selectedPermissionsMap[`${group.controller}:${m.name}`] = shouldCheck;
  });
}

function selectAllPermissions() {
  availablePermissions.value.forEach((g) => {
    g.methods.forEach((m) => {
      selectedPermissionsMap[`${g.controller}:${m.name}`] = true;
    });
  });
}

function clearAllPermissions() {
  Object.keys(selectedPermissionsMap).forEach((key) => {
    selectedPermissionsMap[key] = false;
  });
}

async function reloadCurrentRoles() {
  if (isMasterClinic.value) {
    await onFilterChange(selectedFilterClient.value);
  } else {
    await rolesStore.fetchAll();
  }
}

async function saveRole() {
  const permissions: PermissionRule[] = [];
  Object.entries(selectedPermissionsMap).forEach(([key, isChecked]) => {
    if (isChecked) {
      const [controller, method] = key.split(':');
      if (controller && method) {
        permissions.push({ controller, method });
      }
    }
  });

  saving.value = true;
  try {
    const payload = {
      name: roleForm.name,
      permissions,
      ...(roleForm.client_id ? { client_id: Number(roleForm.client_id) } : {}),
    };

    if (editingRole.value) {
      await rolesStore.update(editingRole.value.id, payload);
      $q.notify({ type: 'positive', message: 'Perfil atualizado com sucesso.', position: 'top' });
    } else {
      await rolesStore.create(payload);
      $q.notify({ type: 'positive', message: 'Perfil criado com sucesso.', position: 'top' });
    }
    await reloadCurrentRoles();
    dialogOpen.value = false;
  } catch (error: any) {
    const msg = error?.response?.data?.message || 'Erro ao salvar perfil.';
    $q.notify({ type: 'negative', message: msg, position: 'top' });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(role: RoleItem) {
  $q.dialog({
    title: 'Excluir Perfil',
    message: `Deseja realmente excluir o perfil <strong>${role.name}</strong>?`,
    html: true,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await rolesStore.remove(role.id);
      $q.notify({ type: 'positive', message: 'Perfil excluído.', position: 'top' });
      await reloadCurrentRoles();
    } catch {
      $q.notify({ type: 'negative', message: 'Erro ao excluir perfil.', position: 'top' });
    }
  });
}

onMounted(async () => {
  if (isMasterClinic.value) {
    await clientsStore.fetchAll();
    await rolesStore.fetchAll('all');
  } else {
    await rolesStore.fetchAll();
  }
  await rolesStore.fetchAvailablePermissions();
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

.role-avatar {
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
