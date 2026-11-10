<template>
  <q-page padding class="patient-form-page">
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="arrow_back" color="primary" :to="{ name: 'patients' }" class="q-mr-sm" />
      <div>
        <div class="text-h5 text-weight-bolder text-dark">
          {{ isEdit ? 'Editar Paciente' : 'Novo Paciente' }}
        </div>
        <div class="text-caption text-grey-7">
          {{ isEdit ? 'Atualize os dados cadastrais' : 'Preencha os dados para cadastrar' }}
        </div>
      </div>
    </div>

    <q-form @submit.prevent="onSubmit">
      <div class="column q-gutter-y-lg">
        <!-- Dados pessoais -->
        <q-card flat bordered class="form-card">
          <q-card-section class="q-pa-md q-pa-sm-lg">
            <div class="text-subtitle1 text-weight-bolder text-dark q-mb-md row items-center">
              <div class="card-icon-box q-mr-sm">
                <q-icon name="person" color="primary" size="20px" />
              </div>
              Dados Pessoais
            </div>

            <!-- Grade com q-col-gutter-md em vez de q-gutter -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.name"
                  label="Nome completo *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Nome obrigatório']"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="form.cpf"
                  label="CPF *"
                  outlined
                  dense
                  mask="###.###.###-##"
                  :rules="[(v) => !!v || 'CPF obrigatório']"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="form.birthDate"
                  label="Data de nascimento *"
                  outlined
                  dense
                  mask="##/##/####"
                  placeholder="DD/MM/AAAA"
                  :rules="[(v) => !!v || 'Data obrigatória']"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.cellphone"
                  label="Celular *"
                  outlined
                  dense
                  mask="(##) #####-####"
                  :rules="[(v) => !!v || 'Celular obrigatório']"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.email"
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
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.occupation"
                  label="Profissão"
                  outlined
                  dense
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Endereço -->
        <q-card flat bordered class="form-card">
          <q-card-section class="q-pa-md q-pa-sm-lg">
            <div class="text-subtitle1 text-weight-bolder text-dark q-mb-md row items-center">
              <div class="card-icon-box q-mr-sm">
                <q-icon name="location_on" color="primary" size="20px" />
              </div>
              Endereço
            </div>

            <!-- Grade com q-col-gutter-md em vez de q-gutter -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.address"
                  label="Endereço (rua, número)"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.neighborhood"
                  label="Bairro"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-5">
                <q-input
                  v-model="form.city"
                  label="Cidade"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="form.state"
                  label="Estado (UF)"
                  outlined
                  dense
                  maxlength="2"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.country"
                  label="País"
                  outlined
                  dense
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Ações -->
      <div class="row q-gutter-sm q-mt-lg justify-end">
        <q-btn flat label="Cancelar" color="grey-7" :to="{ name: 'patients' }" />
        <q-btn
          unelevated
          type="submit"
          :label="isEdit ? 'Salvar Alterações' : 'Cadastrar Paciente'"
          color="primary"
          :loading="loading"
          class="picpay-btn"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePatientsStore } from 'src/stores/patients';
import { useAuthStore } from 'src/stores/auth';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const patientsStore = usePatientsStore();
const authStore = useAuthStore();

const loading = ref(false);
const isEdit = computed(() => !!route.params['id']);

const form = reactive({
  name: '',
  cpf: '',
  birthDate: '',
  cellphone: '',
  email: '',
  occupation: '',
  address: '',
  neighborhood: '',
  city: '',
  state: '',
  country: 'Brasil',
});

function parseDateToApi(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

function parseDateFromApi(dateStr: string): string {
  if (!dateStr) return '';
  const [datePart] = dateStr.split('T');
  if (!datePart) return dateStr;
  const parts = datePart.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

async function onSubmit() {
  loading.value = true;
  try {
    const payload = {
      ...form,
      birthDate: parseDateToApi(form.birthDate),
    };

    if (isEdit.value) {
      await patientsStore.update(Number(route.params['id']), payload);
      $q.notify({ type: 'positive', message: 'Paciente atualizado com sucesso.', position: 'top' });
    } else {
      await patientsStore.create(payload);
      $q.notify({ type: 'positive', message: 'Paciente cadastrado com sucesso.', position: 'top' });
    }
    router.push({ name: 'patients' });
  } catch (error: any) {
    const msg = error?.response?.data?.message || 'Erro ao salvar paciente.';
    $q.notify({ type: 'negative', message: msg, position: 'top' });
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true;
    try {
      const patient = await patientsStore.fetchOne(Number(route.params['id']));
      if (patient) {
        form.name = patient.name ?? '';
        form.cpf = patient.cpf ?? '';
        form.birthDate = parseDateFromApi(patient.birthDate ?? '');
        form.cellphone = patient.cellphone ?? '';
        form.email = patient.email ?? '';
        form.occupation = patient.occupation ?? '';
        form.address = patient.address ?? '';
        form.neighborhood = patient.neighborhood ?? '';
        form.city = patient.city ?? '';
        form.state = patient.state ?? '';
        form.country = patient.country ?? 'Brasil';
      }
    } catch {
      $q.notify({ type: 'negative', message: 'Erro ao carregar paciente.', position: 'top' });
      router.push({ name: 'patients' });
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped lang="scss">
.patient-form-page {
  max-width: 1100px;
  margin: 0 auto;
}

.form-card {
  border-radius: 20px;
  background: #FFFFFF;
}

.card-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(17, 199, 111, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.picpay-btn {
  border-radius: 999px;
  font-weight: 700;
  padding: 10px 24px;
}
</style>
