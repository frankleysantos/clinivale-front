<template>
  <q-page class="row justify-center items-center q-pa-md auth-page" style="min-height: 100vh">
    <div class="col-xs-12 col-sm-8 col-md-5 col-lg-4 auth-container">
      <!-- Card Flutuante com Sombra Suave e Cantos Arredondados estilo PicPay -->
      <q-card flat class="login-box q-pa-lg q-pa-sm-xl">
        <!-- Logo e Cabeçalho -->
        <div class="text-center q-mb-lg q-mb-sm-xl">
          <div class="brand-logo-ring q-mx-auto q-mb-md">
            <q-icon name="local_pharmacy" size="30px" color="white" />
          </div>
          <div class="text-h4 text-weight-bolder text-dark login-brand-title">
            Minha Saúde
          </div>
          <div class="text-caption text-grey-6 q-mt-xs login-subtitle">
            Gestão Farmacêutica & Clínica Integrada
          </div>
        </div>

        <!-- Formulário -->
        <q-form @submit.prevent="onSubmit" class="q-gutter-y-md">
          <div>
            <label class="input-title">E-mail de acesso</label>
            <q-input
              v-model="form.email"
              type="email"
              outlined
              dense
              placeholder="exemplo@clinivale.com"
              autocomplete="email"
              class="auth-input"
              :rules="[
                (v) => !!v || 'E-mail obrigatório',
                (v) => /.+@.+\..+/.test(v) || 'E-mail inválido',
              ]"
            >
              <template #prepend>
                <q-icon name="mail_outline" color="grey-6" size="20px" />
              </template>
            </q-input>
          </div>

          <div>
            <label class="input-title">Senha de segurança</label>
            <q-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              outlined
              dense
              placeholder="••••••••"
              autocomplete="current-password"
              class="auth-input"
              :rules="[(v) => !!v || 'Senha obrigatória']"
            >
              <template #prepend>
                <q-icon name="lock_outline" color="grey-6" size="20px" />
              </template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer text-grey-6"
                  size="20px"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>

          <q-btn
            type="submit"
            label="Acessar Sistema"
            color="primary"
            class="full-width login-submit-btn"
            size="lg"
            :loading="loading"
            unelevated
          >
            <template #loading>
              <q-spinner-dots size="26px" />
            </template>
          </q-btn>
        </q-form>
      </q-card>

      <!-- Rodapé discreto -->
      <div class="text-center text-caption text-grey-5 q-mt-lg opacity-75">
        &copy; {{ new Date().getFullYear() }} Clinivale SaaS • Todos os direitos reservados
      </div>
    </div>

    <!-- Modal de Seleção de Unidade estilo Bottom Sheet no mobile -->
    <q-dialog v-model="showClientDialog" persistent>
      <q-card style="min-width: 320px; width: 420px" class="q-pa-md modal-client-box">
        <q-card-section class="row items-center q-pb-none">
          <div class="modal-gem q-mr-md">
            <q-icon name="storefront" color="primary" size="22px" />
          </div>
          <div>
            <div class="text-h6 text-weight-bolder text-dark">Selecione a Clínica</div>
            <div class="text-caption text-grey-6">
              Escolha a unidade na qual você irá atuar:
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-select
            v-model="selectedClientId"
            :options="availableClients"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            outlined
            dense
            label="Estabelecimento"
          >
            <template #prepend>
              <q-icon name="apartment" color="primary" />
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none q-px-md q-pb-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Confirmar e Entrar"
            color="primary"
            :disable="!selectedClientId"
            :loading="loading"
            class="picpay-action-btn"
            @click="onSelectClient"
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

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
});

const showPassword = ref(false);
const loading = ref(false);

const showClientDialog = ref(false);
const availableClients = ref<Client[]>([]);
const selectedClientId = ref<number | null>(null);

async function onSubmit() {
  loading.value = true;
  try {
    const res = await authStore.login(form.email, form.password);

    if (res.requires_client_selection && res.clients) {
      availableClients.value = res.clients;
      selectedClientId.value = res.clients[0]?.id ?? null;
      showClientDialog.value = true;
      return;
    }

    $q.notify({
      type: 'positive',
      message: 'Login realizado com sucesso!',
      position: 'top',
    });
    router.push({ name: 'dashboard' });
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      'Credenciais inválidas. Verifique seu e-mail e senha.';
    $q.notify({
      type: 'negative',
      message: Array.isArray(message) ? message.join(', ') : message,
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}

async function onSelectClient() {
  if (!selectedClientId.value) return;
  loading.value = true;
  try {
    await authStore.login(
      form.email,
      form.password,
      selectedClientId.value,
    );
    showClientDialog.value = false;
    $q.notify({
      type: 'positive',
      message: 'Acesso autorizado com sucesso!',
      position: 'top',
    });
    router.push({ name: 'dashboard' });
  } catch (error: any) {
    const message =
      error?.response?.data?.message || 'Erro ao selecionar a clínica.';
    $q.notify({
      type: 'negative',
      message,
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.auth-container {
  max-width: 440px;
  width: 100%;
}

.login-box {
  border-radius: 24px;
  background: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.45);
}

.brand-logo-ring {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: linear-gradient(135deg, #11C76F 0%, #0A8B4C 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(17, 199, 111, 0.45);
}

.login-brand-title {
  letter-spacing: -0.03em;
  line-height: 1.1;
  font-size: 1.75rem;
}

.login-subtitle {
  font-size: 0.85rem;
  line-height: 1.3;
}

.input-title {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.login-submit-btn {
  height: 48px;
  font-size: 0.95rem;
  font-weight: 800;
  border-radius: 999px;
  margin-top: 20px;
}

.modal-client-box {
  border-radius: 20px;
}

.modal-gem {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(17, 199, 111, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.picpay-action-btn {
  border-radius: 999px;
  font-weight: 700;
  padding: 8px 18px;
}
</style>
