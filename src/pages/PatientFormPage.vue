<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="arrow_back" color="primary" :to="{ name: 'patients' }" class="q-mr-sm" />
      <div>
        <div class="text-h5 text-weight-bold text-primary">
          {{ isEdit ? 'Editar Paciente' : 'Novo Paciente' }}
        </div>
        <div class="text-caption text-grey-6">
          {{ isEdit ? 'Atualize os dados do paciente' : 'Preencha os dados para cadastrar' }}
        </div>
      </div>
    </div>

    <q-form @submit.prevent="onSubmit">
      <div class="row q-gutter-md">
        <!-- Dados pessoais -->
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                <q-icon name="person" color="primary" class="q-mr-xs" />
                Dados Pessoais
              </div>
              <div class="row q-gutter-md">
                <div class="col-xs-12 col-sm-6">
                  <q-input
                    v-model="form.name"
                    label="Nome completo *"
                    outlined
                    dense
                    :rules="[(v) => !!v || 'Nome obrigatório']"
                  />
                </div>
                <div class="col-xs-12 col-sm-3">
                  <q-input
                    v-model="form.cpf"
                    label="CPF *"
                    outlined
                    dense
                    mask="###.###.###-##"
                    :rules="[(v) => !!v || 'CPF obrigatório']"
                  />
                </div>
                <div class="col-xs-12 col-sm-3">
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
                <div class="col-xs-12 col-sm-4">
                  <q-input
                    v-model="form.cellphone"
                    label="Celular *"
                    outlined
                    dense
                    mask="(##) #####-####"
                    :rules="[(v) => !!v || 'Celular obrigatório']"
                  />
                </div>
                <div class="col-xs-12 col-sm-4">
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
                <div class="col-xs-12 col-sm-4">
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
        </div>

        <!-- Endereço -->
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                <q-icon name="location_on" color="primary" class="q-mr-xs" />
                Endereço
              </div>
              <div class="row q-gutter-md">
                <div class="col-xs-12 col-sm-6">
                  <q-input
                    v-model="form.address"
                    label="Endereço (rua, número)"
                    outlined
                    dense
                  />
                </div>
                <div class="col-xs-12 col-sm-6">
                  <q-input
                    v-model="form.neighborhood"
                    label="Bairro"
                    outlined
                    dense
                  />
                </div>
                <div class="col-xs-12 col-sm-4">
                  <q-input
                    v-model="form.city"
                    label="Cidade"
                    outlined
                    dense
                  />
                </div>
                <div class="col-xs-12 col-sm-2">
                  <q-input
                    v-model="form.state"
                    label="Estado (UF)"
                    outlined
                    dense
                    maxlength="2"
                  />
                </div>
                <div class="col-xs-12 col-sm-3">
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
      </div>

      <!-- Ações -->
      <div class="row q-gutter-md q-mt-md justify-end">
        <q-btn flat label="Cancelar" color="grey" :to="{ name: 'patients' }" />
        <q-btn
          unelevated
          type="submit"
          :label="isEdit ? 'Salvar alterações' : 'Cadastrar paciente'"
          color="primary"
          :loading="loading"
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

function parseDateToISO(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.replace(/\D/g, '').match(/.{1,2}/g) ?? [];
  return `${yyyy}-${mm}-${dd}`;
}

function parseDateFromISO(iso: string): string {
  if (!iso) return '';
  const date = iso.split('T')[0] ?? '';
  const [yyyy, mm, dd] = date.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

onMounted(async () => {
  if (isEdit.value) {
    const id = Number(route.params['id']);
    const patient = await patientsStore.fetchOne(id);
    if (patient) {
      form.name = patient.name;
      form.cpf = patient.cpf;
      form.birthDate = parseDateFromISO(patient.birthDate);
      form.cellphone = patient.cellphone;
      form.email = patient.email;
      form.occupation = patient.occupation ?? '';
      form.address = patient.address ?? '';
      form.neighborhood = patient.neighborhood ?? '';
      form.city = patient.city ?? '';
      form.state = patient.state ?? '';
      form.country = patient.country ?? 'Brasil';
    }
  }
});

async function onSubmit() {
  loading.value = true;
  try {
    const clientId = authStore.user?.client?.id ?? 0;
    const payload = {
      client_id: clientId,
      name: form.name,
      cpf: form.cpf.replace(/\D/g, ''),
      birthDate: parseDateToISO(form.birthDate),
      cellphone: form.cellphone,
      email: form.email,
      ...(form.occupation ? { occupation: form.occupation } : {}),
      ...(form.address ? { address: form.address } : {}),
      ...(form.neighborhood ? { neighborhood: form.neighborhood } : {}),
      ...(form.city ? { city: form.city } : {}),
      ...(form.state ? { state: form.state } : {}),
      ...(form.country ? { country: form.country } : {}),
    };

    if (isEdit.value) {
      await patientsStore.update(Number(route.params['id']), payload);
      $q.notify({ type: 'positive', message: 'Paciente atualizado com sucesso.', position: 'top' });
    } else {
      await patientsStore.create(payload);
      $q.notify({ type: 'positive', message: 'Paciente cadastrado com sucesso.', position: 'top' });
    }

    void router.push({ name: 'patients' });
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao salvar paciente. Verifique os dados.', position: 'top' });
  } finally {
    loading.value = false;
  }
}
</script>
