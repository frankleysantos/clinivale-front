<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-primary">Perfis e Permissões</div>
        <div class="text-caption text-grey-6">Crie e gerencie as roles do sistema com suas respectivas regras de acesso</div>
      </div>
      <q-btn
        unelevated
        color="primary"
        icon="add_moderator"
        label="Novo Perfil"
        @click="openDialog()"
      />
    </div>

    <!-- Tabela de Roles -->
    <q-card flat bordered class="q-mb-md">
      <q-table
        :rows="roles"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :rows-per-page-options="[10, 20, 50]"
        flat
        no-data-label="Nenhum perfil cadastrado"
        loading-label="Carregando perfis..."
      >
        <!-- Permissões / Regras -->
        <template #body-cell-permissions="props">
          <q-td :props="props">
            <div class="row items-center gap-1">
              <q-badge color="secondary" class="q-mr-xs">
                {{ props.row.permissions?.length || 0 }} regras
              </q-badge>
              <span class="text-caption text-grey-7">
                {{ formatPermissionsPreview(props.row.permissions) }}
              </span>
            </div>
          </q-td>
        </template>

        <!-- Ações -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn flat dense round icon="edit" color="primary" @click="openDialog(props.row)">
              <q-tooltip>Editar Perfil</q-tooltip>
            </q-btn>
            <q-btn flat dense round icon="delete" color="negative" @click="confirmDelete(props.row)">
              <q-tooltip>Excluir Perfil</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Criar / Editar Role -->
    <q-dialog v-model="dialogOpen" persistent max-width="700px" style="width: 700px">
      <q-card style="width: 100%; max-width: 700px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">
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

            <!-- Seção de Permissões -->
            <div class="q-mt-sm">
              <div class="row items-center justify-between q-mb-sm">
                <span class="text-subtitle2 text-weight-bold text-grey-8">
                  Regras de Acesso por Módulo
                </span>
                <div class="q-gutter-xs">
                  <q-btn flat dense size="sm" color="primary" label="Marcar Todas" @click="selectAllPermissions" />
                  <q-btn flat dense size="sm" color="grey" label="Desmarcar Todas" @click="clearAllPermissions" />
                </div>
              </div>

              <q-list bordered separator class="rounded-borders bg-grey-1">
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
                      <q-item-label>{{ group.label }}</q-item-label>
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
                          v-model="selectedPermissionsMap[`${group.controller}:${method.name}`]"
                          :label="method.label"
                          dense
                        />
                      </div>
                    </div>
                  </q-card>
                </q-expansion-item>
              </q-list>
            </div>

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn
                unelevated
                type="submit"
                :label="editingRole ? 'Salvar Alterações' : 'Criar Perfil'"
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
import { useRolesStore, type RoleItem, type AvailablePermissionGroup, type PermissionRule } from 'src/stores/roles';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const rolesStore = useRolesStore();
const { roles, availablePermissions, loading } = storeToRefs(rolesStore);

const dialogOpen = ref(false);
const saving = ref(false);
const editingRole = ref<RoleItem | null>(null);

const roleForm = reactive({
  name: '',
});

// Mapa de controle reativo para checkboxes `Controller:Method` => boolean
const selectedPermissionsMap = reactive<Record<string, boolean>>({});

const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' as const },
  { name: 'name', label: 'Nome do Perfil', field: 'name', sortable: true, align: 'left' as const },
  { name: 'permissions', label: 'Regras de Permissão', field: 'permissions', align: 'left' as const },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'right' as const },
];

function formatPermissionsPreview(permissions?: PermissionRule[]): string {
  if (!permissions || permissions.length === 0) return 'Sem regras especificadas';
  const controllers = Array.from(new Set(permissions.map((p) => p.controller)));
  return `Módulos: ${controllers.join(', ')}`;
}

async function openDialog(role?: RoleItem) {
  editingRole.value = role ?? null;
  roleForm.name = role?.name ?? '';

  // Limpar mapa
  Object.keys(selectedPermissionsMap).forEach((key) => {
    delete selectedPermissionsMap[key];
  });

  // Garantir permissões carregadas
  if (availablePermissions.value.length === 0) {
    await rolesStore.fetchAvailablePermissions();
  }

  // Se editando, preencher mapa a partir de role.permissions
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

async function saveRole() {
  // Extrair regras marcadas
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
    if (editingRole.value) {
      await rolesStore.update(editingRole.value.id, {
        name: roleForm.name,
        permissions,
      });
      $q.notify({ type: 'positive', message: 'Perfil atualizado com sucesso.', position: 'top' });
    } else {
      await rolesStore.create({
        name: roleForm.name,
        permissions,
      });
      $q.notify({ type: 'positive', message: 'Perfil criado com sucesso.', position: 'top' });
    }
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
    } catch {
      $q.notify({ type: 'negative', message: 'Erro ao excluir perfil.', position: 'top' });
    }
  });
}

onMounted(async () => {
  await rolesStore.fetchAll();
  await rolesStore.fetchAvailablePermissions();
});
</script>
