<template>
  <q-page padding class="responsive-page">
    <div class="row items-center justify-between q-mb-md q-mb-sm-lg gap-sm">
      <div>
        <div class="text-h5 text-weight-bolder text-dark">Usuários</div>
        <div class="text-caption text-grey-7">Gerencie colaboradores, profissionais de saúde e níveis de acesso</div>
      </div>
      <q-btn
        v-if="authStore.hasPermission('UserController', 'create')"
        unelevated
        color="primary"
        icon="add"
        label="Novo Usuário"
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

    <!-- Tabela Híbrida de Usuários: Desktop Tabela / Mobile Cards PicPay -->
    <q-card flat bordered class="table-card">
      <q-table
        :rows="users"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :grid="$q.screen.lt.sm"
        :rows-per-page-options="[10, 20, 50]"
        flat
        no-data-label="Nenhum usuário encontrado"
        loading-label="Carregando usuários..."
        class="responsive-table"
      >
        <!-- Card Mobile PicPay -->
        <template #item="props">
          <div class="col-12 q-pa-xs">
            <q-card flat class="mobile-item-card q-pa-md">
              <div class="row items-center justify-between no-wrap q-mb-xs">
                <div class="row items-center no-wrap ellipsis">
                  <div class="user-avatar q-mr-sm">
                    <q-icon
                      :name="props.row.professional ? 'medical_services' : 'person'"
                      size="18px"
                      color="primary"
                    />
                  </div>
                  <div class="text-weight-bold text-dark ellipsis text-subtitle2">
                    {{ props.row.name }}
                  </div>
                </div>
                <div class="row items-center no-wrap q-gutter-xs">
                  <q-btn
                    v-if="authStore.hasPermission('UserController', 'update')"
                    flat
                    dense
                    round
                    icon="edit"
                    color="primary"
                    size="sm"
                    @click="openDialog(props.row)"
                  />
                  <q-btn
                    v-if="authStore.hasPermission('UserController', 'remove')"
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

              <div class="text-caption text-grey-7 q-mb-xs">
                <q-icon name="mail_outline" size="14px" class="q-mr-xs" />
                {{ props.row.email }}
              </div>

              <!-- Badge de Profissional de Saúde e Especialidades no Mobile -->
              <div v-if="props.row.professional" class="q-mb-xs">
                <q-badge color="teal-1" text-color="teal-9" class="q-pa-xs text-weight-medium">
                  <q-icon name="badge" size="14px" class="q-mr-xs" />
                  {{ props.row.professional.profession?.name || 'Profissional' }} — {{ props.row.professional.council?.code || 'Conselho' }} {{ props.row.professional.council_number }}/{{ props.row.professional.council_uf }}
                </q-badge>

                <div v-if="props.row.professional.specialties?.length" class="row q-gutter-xs q-mt-xs">
                  <q-badge
                    v-for="esp in props.row.professional.specialties"
                    :key="esp.id"
                    color="green-1"
                    text-color="green-9"
                  >
                    {{ esp.name }}
                  </q-badge>
                </div>
              </div>

              <q-separator class="q-my-xs opacity-40" />

              <div class="row items-center justify-between q-mt-xs">
                <div class="text-caption text-grey-6 ellipsis" style="max-width: 50%">
                  {{ props.row.client?.name || '—' }}
                </div>
                <div class="row items-center q-gutter-xs">
                  <q-badge
                    v-for="role in props.row.roles"
                    :key="role.id"
                    color="primary"
                  >
                    {{ role.name }}
                  </q-badge>
                  <span v-if="!props.row.roles?.length" class="text-caption text-grey-5">—</span>
                </div>
              </div>
            </q-card>
          </div>
        </template>

        <!-- Template Desktop -->
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <span class="text-weight-medium text-dark">{{ props.row.name }}</span>
              <q-badge
                v-if="props.row.professional"
                color="teal-1"
                text-color="teal-9"
                class="q-ml-sm text-caption text-weight-bold"
              >
                <q-icon name="medical_services" size="12px" class="q-mr-xs" />
                {{ props.row.professional.profession?.name }}
              </q-badge>
            </div>
          </q-td>
        </template>

        <template #body-cell-professional="props">
          <q-td :props="props">
            <div v-if="props.row.professional">
              <div class="text-weight-bold text-dark text-caption">
                {{ props.row.professional.council?.code || 'Conselho' }} {{ props.row.professional.council_number }}/{{ props.row.professional.council_uf }}
              </div>
              <div v-if="props.row.professional.specialties?.length" class="row q-gutter-xs q-mt-xs">
                <q-badge
                  v-for="esp in props.row.professional.specialties"
                  :key="esp.id"
                  color="green-1"
                  text-color="green-9"
                  class="text-weight-medium"
                >
                  {{ esp.name }}
                </q-badge>
              </div>
            </div>
            <span v-else class="text-grey-5 text-caption">—</span>
          </q-td>
        </template>

        <template #body-cell-roles="props">
          <q-td :props="props">
            <q-badge
              v-for="role in props.row.roles"
              :key="role.id"
              color="primary"
              class="q-mr-xs q-mb-xs"
            >
              {{ role.name }}
            </q-badge>
            <span v-if="!props.row.roles?.length" class="text-grey-5 text-caption">—</span>
          </q-td>
        </template>

        <template #body-cell-client="props">
          <q-td :props="props">
            <q-badge v-if="props.row.client?.name" color="grey-2" text-color="dark" class="text-weight-bold">
              {{ props.row.client.name }}
            </q-badge>
            <span v-else class="text-caption text-grey-6">—</span>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right no-wrap">
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

    <!-- Dialog Criar/Editar Usuário Responsivo -->
    <q-dialog v-model="dialogOpen" persistent max-width="720px">
      <q-card style="min-width: 320px; width: 720px; max-width: 95vw;" class="q-pa-sm">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bolder text-dark">
            {{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="saveUser">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="userForm.name"
                  label="Nome *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Nome obrigatório']"
                />
              </div>

              <div class="col-12 col-sm-6">
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
              </div>

              <div v-if="!editingUser" class="col-12">
                <q-input
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
              </div>

              <div v-if="isMasterClinic" class="col-12 col-sm-6">
                <q-select
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
              </div>

              <div class="col-12" :class="{ 'col-sm-6': isMasterClinic }">
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
              </div>

              <!-- Seção Profissional de Saúde -->
              <div class="col-12">
                <q-card flat bordered class="q-pa-md bg-grey-1 rounded-borders">
                  <div class="row items-center justify-between no-wrap">
                    <div>
                      <div class="text-subtitle2 text-weight-bold text-dark">
                        Profissional de Saúde
                      </div>
                      <div class="text-caption text-grey-7">
                        Habilite caso o usuário atue como médico, fisioterapeuta, psicólogo, etc.
                      </div>
                    </div>
                    <q-toggle
                      :model-value="!!userForm.is_health_professional"
                      @update:model-value="(val) => (userForm.is_health_professional = !!val)"
                      color="primary"
                    />
                  </div>

                  <q-slide-transition>
                    <div v-if="userForm.is_health_professional" class="q-mt-md">
                      <div class="row q-col-gutter-md">
                        <!-- Selecionar Profissão -->
                        <div class="col-12 col-sm-6">
                          <q-select
                            v-model="userForm.professional.profession_id"
                            :options="professions"
                            option-value="id"
                            option-label="name"
                            emit-value
                            map-options
                            outlined
                            dense
                            label="Profissão *"
                            hint="Ex: Médico, Cirurgião-Dentista, Psicólogo"
                            :rules="[v => !userForm.is_health_professional || !!v || 'Profissão obrigatória']"
                            @update:model-value="onProfessionChange"
                          />
                        </div>

                        <!-- Selecionar Conselho -->
                        <div class="col-12 col-sm-6">
                          <q-select
                            v-model="userForm.professional.council_id"
                            :options="councils"
                            option-value="id"
                            :option-label="(opt) => opt ? `${opt.code} - ${opt.name}` : ''"
                            emit-value
                            map-options
                            outlined
                            dense
                            label="Conselho Profissional *"
                            hint="Ex: CRM, CRO, CRP"
                            :rules="[v => !userForm.is_health_professional || !!v || 'Conselho obrigatório']"
                          />
                        </div>

                        <!-- Número no Conselho -->
                        <div class="col-12 col-sm-4">
                          <q-input
                            v-model="userForm.professional.council_number"
                            outlined
                            dense
                            label="Número no Conselho *"
                            placeholder="123456"
                            :rules="[v => !userForm.is_health_professional || !!v || 'Número obrigatório']"
                          />
                        </div>

                        <!-- UF do Conselho -->
                        <div class="col-12 col-sm-3">
                          <q-select
                            v-model="userForm.professional.council_uf"
                            :options="ufOptions"
                            outlined
                            dense
                            label="UF *"
                            hint="Estado do Conselho"
                            :rules="[v => !userForm.is_health_professional || !!v || 'UF obrigatória']"
                          />
                        </div>

                        <!-- Especialidades vinculadas à Profissão selecionada (Múltipla escolha) -->
                        <div class="col-12 col-sm-5">
                          <q-select
                            v-model="userForm.professional.specialty_ids"
                            :options="availableSpecialtyOptions"
                            option-value="id"
                            option-label="name"
                            emit-value
                            map-options
                            multiple
                            use-chips
                            outlined
                            dense
                            label="Especialidades"
                            :disable="!userForm.professional.profession_id"
                            :hint="userForm.professional.profession_id ? 'Selecione as especialidades da profissão' : 'Selecione uma profissão primeiro'"
                          />
                        </div>
                      </div>
                    </div>
                  </q-slide-transition>
                </q-card>
              </div>
            </div>

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
              <q-btn
                unelevated
                type="submit"
                :label="editingUser ? 'Salvar Alterações' : 'Criar Usuário'"
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
const { users, loading, councils, professions, specialties } = storeToRefs(usersStore);
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

const ufOptions = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const availableSpecialtyOptions = computed(() => {
  const profId = userForm.professional.profession_id;
  if (!profId) return [];
  return specialties.value.filter((s) => Number(s.profession_id) === Number(profId));
});

const userForm = reactive({
  name: '',
  email: '',
  password: '',
  client_id: null as number | null,
  role_ids: [] as number[],
  is_health_professional: false,
  professional: {
    profession_id: null as number | null,
    council_id: null as number | null,
    council_number: '',
    council_uf: '',
    specialty_ids: [] as number[],
  },
});

const columns = computed(() => {
  const cols = [
    { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' as const },
    { name: 'name', label: 'Nome', field: 'name', sortable: true, align: 'left' as const },
    { name: 'email', label: 'E-mail', field: 'email', align: 'left' as const },
    { name: 'professional', label: 'Profissional / Especialidades', field: 'professional', align: 'left' as const },
    { name: 'client', label: 'Estabelecimento', field: 'client', align: 'left' as const },
    { name: 'roles', label: 'Perfis', field: 'roles', align: 'left' as const },
  ];

  if (authStore.hasPermission('UserController', 'update') || authStore.hasPermission('UserController', 'remove')) {
    cols.push({ name: 'actions', label: 'Ações', field: 'actions', align: 'right' as const });
  }

  return cols;
});

async function onProfessionChange(professionId: number | null) {
  // Limpa especialidades que não pertencem à nova profissão
  userForm.professional.specialty_ids = [];

  if (professionId) {
    const selected = professions.value.find((p) => Number(p.id) === Number(professionId));
    // Preenche automaticamente o conselho padrão da profissão se houver
    if (selected?.council_id) {
      userForm.professional.council_id = selected.council_id;
    }
    // Carrega especialidades da profissão
    await usersStore.fetchSpecialties(professionId);
  }
}

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

  const prof = user?.professional;
  userForm.is_health_professional = !!prof;

  const professionId = prof?.profession_id ?? prof?.profession?.id ?? null;
  const councilId = prof?.council_id ?? prof?.council?.id ?? null;

  userForm.professional = {
    profession_id: professionId,
    council_id: councilId,
    council_number: prof?.council_number ?? '',
    council_uf: prof?.council_uf ?? '',
    specialty_ids: prof?.specialties?.map((s) => s.id) || [],
  };

  const targetClientId = userForm.client_id || authStore.user?.client?.id;
  await rolesStore.fetchAll(targetClientId);

  if (councils.value.length === 0) {
    await usersStore.fetchCouncils();
  }
  if (professions.value.length === 0) {
    await usersStore.fetchProfessions();
  }
  if (professionId) {
    await usersStore.fetchSpecialties(professionId);
  } else if (specialties.value.length === 0) {
    await usersStore.fetchSpecialties();
  }

  if (isMasterClinic.value && clients.value.length === 0) {
    await clientsStore.fetchAll();
  }

  dialogOpen.value = true;
}

async function saveUser() {
  saving.value = true;
  try {
    const payload: any = {
      name: userForm.name,
      email: userForm.email,
      role_ids: userForm.role_ids,
      is_health_professional: !!userForm.is_health_professional,
      ...(userForm.client_id ? { client_id: userForm.client_id } : {}),
    };

    if (userForm.is_health_professional) {
      payload.professional = {
        profession_id: userForm.professional.profession_id,
        council_id: userForm.professional.council_id,
        council_number: userForm.professional.council_number,
        council_uf: userForm.professional.council_uf,
        specialty_ids: userForm.professional.specialty_ids,
      };
    }

    if (editingUser.value) {
      await usersStore.update(editingUser.value.id, payload);
      $q.notify({ type: 'positive', message: 'Usuário atualizado com sucesso.', position: 'top' });
    } else {
      payload.password = userForm.password;
      await usersStore.create(payload);
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
  await Promise.all([
    usersStore.fetchCouncils(),
    usersStore.fetchProfessions(),
    usersStore.fetchSpecialties(),
  ]);

  if (isMasterClinic.value) {
    await clientsStore.fetchAll();
    await usersStore.fetchAll('all');
  } else {
    await usersStore.fetchAll();
  }
  await rolesStore.fetchAll();
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
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.97);
  }
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

.user-avatar {
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
