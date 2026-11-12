<template>
  <q-page padding class="patient-form-page">
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="arrow_back" color="primary" :to="{ name: 'patients' }" class="q-mr-sm" />
      <div>
        <div class="text-h5 text-weight-bolder text-dark">
          {{ isEdit ? 'Editar Paciente' : 'Novo Paciente' }}
        </div>
        <div class="text-caption text-grey-7">
          {{ isEdit ? 'Atualize os dados cadastrais' : 'Preencha os dados em conformidade com as normas SBIS/CFM' }}
        </div>
      </div>
    </div>

    <q-form @submit.prevent="onSubmit">
      <div class="column q-gutter-y-lg">
        <!-- 1. Identificação do Paciente -->
        <q-card flat bordered class="form-card">
          <q-card-section class="q-pa-md q-pa-sm-lg">
            <div class="text-subtitle1 text-weight-bolder text-dark q-mb-md row items-center">
              <div class="card-icon-box q-mr-sm">
                <q-icon name="person" color="primary" size="20px" />
              </div>
              Identificação do Paciente (Normas SBIS/CFM)
            </div>

            <!-- Grade estruturada com q-col-gutter-md -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="form.name"
                  label="Nome completo *"
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Nome completo é obrigatório']"
                />
              </div>

              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.social_name"
                  label="Nome social"
                  outlined
                  dense
                  hint="Como prefere ser chamado (se aplicável)"
                />
              </div>

              <div class="col-12 col-sm-4">
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
                <q-select
                  v-model="form.gender"
                  :options="genderOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  outlined
                  dense
                  label="Sexo ao Nascer *"
                  hint="Padrão SBIS / RNDS"
                  :rules="[(v) => !!v || 'Sexo é obrigatório']"
                />
              </div>

              <div class="col-12 col-sm-4">
                <q-select
                  v-model="form.race"
                  :options="raceOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  outlined
                  dense
                  label="Raça / Cor"
                  hint="Padrão IBGE / SBIS"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.mother_name"
                  label="Nome completo da mãe *"
                  outlined
                  dense
                  hint="Obrigatório SBIS/CFM para desambiguação"
                  :rules="[(v) => !!v || 'Nome da mãe é obrigatório']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.father_name"
                  label="Nome completo do pai"
                  outlined
                  dense
                  hint="Filiação paterna (opcional)"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 2. Documentos e Identificadores Oficiais -->
        <q-card flat bordered class="form-card">
          <q-card-section class="q-pa-md q-pa-sm-lg">
            <div class="text-subtitle1 text-weight-bolder text-dark q-mb-md row items-center">
              <div class="card-icon-box q-mr-sm">
                <q-icon name="badge" color="primary" size="20px" />
              </div>
              Documentos de Identificação (Nacional e Saúde)
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.cpf"
                  label="CPF"
                  outlined
                  dense
                  mask="###.###.###-##"
                  unmasked-value
                  hint="Opcional segundo SBIS (ex: recém-nascidos)"
                />
              </div>

              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.cns"
                  label="Cartão Nacional de Saúde (CNS / SUS)"
                  outlined
                  dense
                  mask="###############"
                  hint="15 dígitos numéricos"
                />
              </div>

              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.rg"
                  label="Número do RG"
                  outlined
                  dense
                  placeholder="Documento de Identidade"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.rg_issuer"
                  label="Órgão Emissor do RG"
                  outlined
                  dense
                  placeholder="Ex: SSP, DETRAN, PC"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.rg_state"
                  :options="ufOptions"
                  outlined
                  dense
                  label="UF do RG"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 3. Contatos e Profissão -->
        <q-card flat bordered class="form-card">
          <q-card-section class="q-pa-md q-pa-sm-lg">
            <div class="text-subtitle1 text-weight-bolder text-dark q-mb-md row items-center">
              <div class="card-icon-box q-mr-sm">
                <q-icon name="contacts" color="primary" size="20px" />
              </div>
              Contatos e Ocupação
            </div>

            <div class="row q-col-gutter-md">
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
                  label="E-mail"
                  type="email"
                  outlined
                  dense
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

        <!-- 4. Endereço e Localização -->
        <q-card flat bordered class="form-card">
          <q-card-section class="q-pa-md q-pa-sm-lg">
            <div class="text-subtitle1 text-weight-bolder text-dark q-mb-md row items-center">
              <div class="card-icon-box q-mr-sm">
                <q-icon name="location_on" color="primary" size="20px" />
              </div>
              Endereço Residencial
            </div>

            <!-- Grade estruturada com q-col-gutter-md -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="form.postal_code"
                  label="CEP"
                  outlined
                  dense
                  mask="#####-###"
                  unmasked-value
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.address"
                  label="Logradouro / Rua"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-sm-3">
                <q-input
                  v-model="form.address_number"
                  label="Número"
                  outlined
                  dense
                  placeholder="Ex: 123 ou S/N"
                />
              </div>

              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.address_complement"
                  label="Complemento"
                  outlined
                  dense
                  placeholder="Ex: Apto 101, Bloco B"
                />
              </div>

              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.neighborhood"
                  label="Bairro"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.city"
                  label="Cidade"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-sm-3">
                <q-select
                  v-model="form.state"
                  :options="ufOptions"
                  outlined
                  dense
                  label="Estado (UF)"
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
          class="picpay-btn lt-sm-full"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePatientsStore, type PatientGender, type PatientRace } from 'src/stores/patients';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const patientsStore = usePatientsStore();

const loading = ref(false);
const isEdit = computed(() => !!route.params['id']);

const genderOptions = [
  { label: 'Masculino', value: 'M' },
  { label: 'Feminino', value: 'F' },
  { label: 'Indeterminado / Não informado', value: 'I' },
];

const raceOptions = [
  { label: 'Branca', value: 'BRANCA' },
  { label: 'Preta', value: 'PRETA' },
  { label: 'Parda', value: 'PARDA' },
  { label: 'Amarela', value: 'AMARELA' },
  { label: 'Indígena', value: 'INDIGENA' },
  { label: 'Não informado', value: 'NAO_INFORMADO' },
];

const ufOptions = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const form = reactive({
  name: '',
  social_name: '',
  cpf: '',
  rg: '',
  rg_issuer: '',
  rg_state: '',
  cns: '',
  birthDate: '',
  gender: 'M' as PatientGender,
  race: 'NAO_INFORMADO' as PatientRace,
  mother_name: '',
  father_name: '',
  cellphone: '',
  email: '',
  occupation: '',
  postal_code: '',
  address: '',
  address_number: '',
  address_complement: '',
  neighborhood: '',
  city: '',
  state: 'SP',
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
      cpf: form.cpf ? form.cpf : undefined,
      rg: form.rg ? form.rg : undefined,
      rg_issuer: form.rg_issuer ? form.rg_issuer : undefined,
      rg_state: form.rg_state ? form.rg_state : undefined,
      cns: form.cns ? form.cns : undefined,
      email: form.email ? form.email : undefined,
      father_name: form.father_name ? form.father_name : undefined,
      social_name: form.social_name ? form.social_name : undefined,
      postal_code: form.postal_code ? form.postal_code : undefined,
      address_number: form.address_number ? form.address_number : undefined,
      address_complement: form.address_complement ? form.address_complement : undefined,
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
        form.social_name = patient.social_name ?? '';
        form.cpf = patient.cpf ?? '';
        form.rg = patient.rg ?? '';
        form.rg_issuer = patient.rg_issuer ?? '';
        form.rg_state = patient.rg_state ?? '';
        form.cns = patient.cns ?? '';
        form.birthDate = parseDateFromApi(patient.birthDate ?? '');
        form.gender = patient.gender || 'M';
        form.race = patient.race || 'NAO_INFORMADO';
        form.mother_name = patient.mother_name ?? '';
        form.father_name = patient.father_name ?? '';
        form.cellphone = patient.cellphone ?? '';
        form.email = patient.email ?? '';
        form.occupation = patient.occupation ?? '';
        form.postal_code = patient.postal_code ?? '';
        form.address = patient.address ?? '';
        form.address_number = patient.address_number ?? '';
        form.address_complement = patient.address_complement ?? '';
        form.neighborhood = patient.neighborhood ?? '';
        form.city = patient.city ?? '';
        form.state = patient.state ?? 'SP';
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
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.97);
  }
}

@media (max-width: 600px) {
  .lt-sm-full {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
