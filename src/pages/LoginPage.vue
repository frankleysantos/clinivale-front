<template>
  <q-page class="row justify-center items-center" style="min-height: 100vh">
    <div class="col-xs-11 col-sm-8 col-md-4 col-lg-3">
      <!-- Card de login -->
      <q-card flat bordered class="q-pa-lg shadow-10">
        <!-- Logo / título -->
        <q-card-section class="text-center q-pb-none">
          <q-icon name="local_pharmacy" size="56px" color="primary" />
          <div class="text-h5 text-weight-bold text-primary q-mt-sm">
            Minha Saúde
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">
            Sistema Farmacêutico — faça login para continuar
          </div>
        </q-card-section>

        <q-separator class="q-my-lg" />

        <!-- Formulário -->
        <q-card-section>
          <q-form @submit.prevent="onSubmit" class="q-gutter-md">
            <q-input
              v-model="form.email"
              label="E-mail"
              type="email"
              outlined
              dense
              autocomplete="email"
              :rules="[
                (v) => !!v || 'E-mail obrigatório',
                (v) => /.+@.+\..+/.test(v) || 'E-mail inválido',
              ]"
            >
              <template #prepend>
                <q-icon name="email" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="form.password"
              label="Senha"
              :type="showPassword ? 'text' : 'password'"
              outlined
              dense
              autocomplete="current-password"
              :rules="[(v) => !!v || 'Senha obrigatória']"
            >
              <template #prepend>
                <q-icon name="lock" color="primary" />
              </template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="Entrar"
              color="primary"
              class="full-width q-mt-md"
              size="md"
              :loading="loading"
              unelevated
            >
              <template #loading>
                <q-spinner-dots />
              </template>
            </q-btn>
          </q-form>
        </q-card-section>
      </q-card>

      <div class="text-center text-caption text-white q-mt-md opacity-70">
        &copy; {{ new Date().getFullYear() }} Minha Saúde
      </div>
    </div>

    <!-- Modal de seleção de Clínica/Cliente -->
    <q-dialog v-model="showClientDialog" persistent>
      <q-card style="min-width: 350px" class="q-pa-sm">
        <q-card-section class="row items-center">
          <q-icon name="business" color="primary" size="28px" class="q-mr-sm" />
          <div>
            <div class="text-h6">Selecione a Clínica</div>
            <div class="text-caption text-grey-6">
              Você possui acesso a múltiplas clínicas. Escolha uma para prosseguir:
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="selectedClientId"
            :options="availableClients"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            label="Clínica / Unidade"
            outlined
            dense
            class="q-mt-sm"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            label="Acessar"
            color="primary"
            unelevated
            :loading="loading"
            :disable="!selectedClientId"
            @click="onSelectClientSubmit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore, type Client } from 'src/stores/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const showPassword = ref(false);

const showClientDialog = ref(false);
const availableClients = ref<Client[]>([]);
const selectedClientId = ref<number | null>(null);

const form = reactive({
  email: '',
  password: '',
});

async function onSubmit() {
  loading.value = true;
  try {
    const res = await authStore.login(form.email, form.password);
    if (res.requires_client_selection && res.clients) {
      availableClients.value = res.clients;
      if (res.clients.length > 0 && res.clients[0]) {
        selectedClientId.value = res.clients[0].id;
      }
      showClientDialog.value = true;
      return;
    }

    $q.notify({
      type: 'positive',
      message: `Bem-vindo, ${authStore.userName}!`,
      position: 'top',
    });
    void router.push({ name: 'dashboard' });
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    $q.notify({
      type: 'negative',
      message:
        msg ||
        (status === 401
          ? 'E-mail ou senha inválidos.'
          : 'Erro ao conectar. Tente novamente.'),
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}

async function onSelectClientSubmit() {
  if (!selectedClientId.value) return;
  loading.value = true;
  try {
    await authStore.login(form.email, form.password, selectedClientId.value);
    showClientDialog.value = false;
    $q.notify({
      type: 'positive',
      message: `Bem-vindo, ${authStore.userName}!`,
      position: 'top',
    });
    void router.push({ name: 'dashboard' });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    $q.notify({
      type: 'negative',
      message: msg || 'Erro ao selecionar a clínica. Tente novamente.',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}
</script>

