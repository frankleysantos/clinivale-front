<template>
  <q-page padding class="patient-record-page">
    <!-- Header do Paciente -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="row items-center">
        <q-btn flat round dense icon="arrow_back" color="primary" :to="{ name: 'patients' }" class="q-mr-sm" />
        <div>
          <div class="text-h5 text-weight-bolder text-dark row items-center">
            {{ patient?.name || 'Prontuário do Paciente' }}
            <q-badge v-if="patient?.social_name" color="teal" class="q-ml-sm" rounded>
              Nome Social: {{ patient.social_name }}
            </q-badge>
          </div>
          <div class="text-caption text-grey-7 row items-center q-gutter-x-sm">
            <span><strong>CNS/SUS:</strong> {{ patient?.cns || '—' }}</span>
            <span>•</span>
            <span><strong>CPF:</strong> {{ patient?.cpf || '—' }}</span>
            <span>•</span>
            <span><strong>Nasc:</strong> {{ formatDate(patient?.birthDate) }}</span>
            <span>•</span>
            <span><strong>Sexo:</strong> {{ formatGender(patient?.gender) }}</span>
          </div>
        </div>
      </div>

      <!-- Ações de Abertura Rápida -->
      <div class="row q-gutter-sm q-mt-sm q-mt-sm-none">
        <q-btn
          outline
          color="primary"
          icon="add_circle"
          label="Nova Ficha / Consulta"
          class="btn-pill"
          @click="openNewRecordModal"
        />
        <q-btn
          color="teal"
          icon="medication"
          label="Nova Receita"
          class="btn-pill"
          @click="openNewPrescriptionModal"
        />
        <q-btn
          color="deep-orange"
          icon="verified"
          label="Emitir Atestado"
          class="btn-pill"
          @click="openNewCertificateModal"
        />
      </div>
    </div>

    <!-- Abas do Prontuário -->
    <q-card flat bordered class="q-mb-md rounded-card">
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey-8"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="records" icon="description" label="Atendimentos (SOAP)" />
        <q-tab name="prescriptions" icon="medication" label="Receitas e Prescrições" />
        <q-tab name="certificates" icon="verified" label="Atestados Médicos" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated class="q-pa-md">
        <!-- 1. Painel de Atendimentos (SOAP) -->
        <q-tab-panel name="records" class="q-pa-none">
          <div v-if="loading" class="row justify-center q-pa-lg">
            <q-spinner-dots color="primary" size="40px" />
          </div>

          <div v-else-if="records.length === 0" class="text-center q-pa-xl text-grey-6">
            <q-icon name="history_edu" size="64px" class="q-mb-sm text-grey-4" />
            <div class="text-h6">Nenhum atendimento registrado</div>
            <div class="text-caption">Clique no botão acima para iniciar um novo atendimento.</div>
          </div>

          <div v-else class="column q-gutter-y-md">
            <q-card
              v-for="rec in records"
              :key="rec.id"
              flat
              bordered
              class="record-card"
            >
              <q-card-section class="row items-center justify-between bg-grey-1 q-py-sm">
                <div class="row items-center q-gutter-x-sm">
                  <q-chip
                    :color="rec.status === 'FINALIZADO' ? 'positive' : 'warning'"
                    text-color="white"
                    size="sm"
                    class="text-weight-bold"
                  >
                    {{ rec.status }}
                  </q-chip>
                  <span class="text-weight-bold text-dark">
                    {{ rec.record_type }} — {{ formatDateTime(rec.started_at) }}
                  </span>
                  <span class="text-caption text-grey-7">
                    • Médico: {{ rec.professional?.user?.name || 'Profissional de Saúde' }}
                    <span v-if="rec.professional?.council_number">
                      ({{ rec.professional?.council?.code || 'CRM' }}: {{ rec.professional.council_number }}/{{ rec.professional.council_uf }})
                    </span>
                  </span>
                </div>

                <div v-if="rec.status === 'EM_ANDAMENTO'">
                  <q-btn
                    color="primary"
                    size="sm"
                    label="Continuar / Finalizar"
                    class="btn-pill"
                    @click="resumeRecord(rec)"
                  />
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section class="q-pa-md">
                <div v-if="rec.chief_complaint" class="q-mb-sm">
                  <div class="text-caption text-weight-bold text-grey-7">QUEIXA PRINCIPAL:</div>
                  <div class="text-body2 text-dark">{{ rec.chief_complaint }}</div>
                </div>

                <!-- Detalhes SOAP -->
                <div class="row q-col-gutter-md q-mt-xs">
                  <div v-if="rec.hda || rec.past_history" class="col-12 col-md-6">
                    <div class="soap-box">
                      <div class="soap-badge subjective">S - Subjetivo (Anamnese)</div>
                      <div class="soap-content">
                        <div v-if="rec.hda"><strong>HDA:</strong> {{ rec.hda }}</div>
                        <div v-if="rec.past_history" class="q-mt-xs"><strong>Antecedentes:</strong> {{ rec.past_history }}</div>
                        <div v-if="rec.family_history" class="q-mt-xs"><strong>Histórico Familiar:</strong> {{ rec.family_history }}</div>
                      </div>
                    </div>
                  </div>

                  <div v-if="rec.physical_exam || rec.vital_signs" class="col-12 col-md-6">
                    <div class="soap-box">
                      <div class="soap-badge objective">O - Objetivo (Exame Físico & Sinais Vitais)</div>
                      <div class="soap-content">
                        <div v-if="rec.vital_signs" class="row q-gutter-x-sm text-caption q-mb-xs">
                          <span v-if="rec.vital_signs.systolic_bp && rec.vital_signs.diastolic_bp">
                            <strong>PA:</strong> {{ rec.vital_signs.systolic_bp }}/{{ rec.vital_signs.diastolic_bp }} mmHg
                          </span>
                          <span v-if="rec.vital_signs.heart_rate">
                            <strong>FC:</strong> {{ rec.vital_signs.heart_rate }} bpm
                          </span>
                          <span v-if="rec.vital_signs.temperature">
                            <strong>Temp:</strong> {{ rec.vital_signs.temperature }} °C
                          </span>
                          <span v-if="rec.vital_signs.spo2">
                            <strong>SpO2:</strong> {{ rec.vital_signs.spo2 }}%
                          </span>
                        </div>
                        <div v-if="rec.physical_exam">{{ rec.physical_exam }}</div>
                      </div>
                    </div>
                  </div>

                  <div v-if="rec.diagnostic_hypothesis || rec.cid10" class="col-12 col-md-6">
                    <div class="soap-box">
                      <div class="soap-badge assessment">A - Avaliação (Diagnóstico)</div>
                      <div class="soap-content">
                        <div v-if="rec.diagnostic_hypothesis">{{ rec.diagnostic_hypothesis }}</div>
                        <div v-if="rec.cid10" class="q-mt-xs">
                          <q-badge color="grey-8">CID-10: {{ rec.cid10 }}</q-badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="rec.clinical_conduct" class="col-12 col-md-6">
                    <div class="soap-box">
                      <div class="soap-badge plan">P - Plano / Conduta</div>
                      <div class="soap-content">{{ rec.clinical_conduct }}</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- 2. Painel de Receitas e Prescrições -->
        <q-tab-panel name="prescriptions" class="q-pa-none">
          <div v-if="prescriptions.length === 0" class="text-center q-pa-xl text-grey-6">
            <q-icon name="medication" size="64px" class="q-mb-sm text-grey-4" />
            <div class="text-h6">Nenhuma prescrição encontrada</div>
            <div class="text-caption">Emita receitas simples, antimicrobianos ou de controle especial.</div>
          </div>

          <div v-else class="column q-gutter-y-md">
            <q-card
              v-for="rx in prescriptions"
              :key="rx.id"
              flat
              bordered
              class="record-card"
            >
              <q-card-section class="row items-center justify-between bg-grey-1 q-py-sm">
                <div class="row items-center q-gutter-x-sm">
                  <q-chip
                    :color="getPrescriptionColor(rx.prescription_type)"
                    text-color="white"
                    size="sm"
                    class="text-weight-bold"
                  >
                    {{ rx.prescription_type?.replace('_', ' ') }}
                  </q-chip>
                  <span class="text-weight-bold text-dark">
                    Emitida em {{ formatDate(rx.createdAt) }}
                  </span>
                  <span class="text-caption text-grey-7">
                    • Válida até: {{ formatDate(rx.expires_at) }}
                  </span>
                  <span class="text-caption text-teal text-mono text-weight-bold">
                    [Cód: {{ rx.verification_code }}]
                  </span>
                </div>

                <q-btn
                  flat
                  color="primary"
                  icon="print"
                  label="Imprimir Receita"
                  class="btn-pill"
                  @click="openPrintModal(rx.id)"
                />
              </q-card-section>

              <q-separator />

              <q-card-section class="q-pa-md">
                <div class="text-subtitle2 text-weight-bold text-dark q-mb-xs">Medicamentos Prescritos:</div>
                <q-list dense separator>
                  <q-item v-for="(it, idx) in rx.items" :key="idx" class="q-px-none">
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-primary">
                        {{ idx + 1 }}. {{ it.medication_name }} {{ it.concentration ? `(${it.concentration})` : '' }} — {{ it.quantity }}
                      </q-item-label>
                      <q-item-label caption>
                        Posologia: {{ it.dosage }} (Via {{ it.route || 'Oral' }})
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- 3. Painel de Atestados Médicos -->
        <q-tab-panel name="certificates" class="q-pa-none">
          <div v-if="certificates.length === 0" class="text-center q-pa-xl text-grey-6">
            <q-icon name="verified" size="64px" class="q-mb-sm text-grey-4" />
            <div class="text-h6">Nenhum atestado emitido</div>
            <div class="text-caption">Emita atestados de comparecimento, afastamento ou aptidão.</div>
          </div>

          <div v-else class="column q-gutter-y-md">
            <q-card
              v-for="cert in certificates"
              :key="cert.id"
              flat
              bordered
              class="record-card"
            >
              <q-card-section class="row items-center justify-between bg-grey-1 q-py-sm">
                <div class="row items-center q-gutter-x-sm">
                  <q-chip color="deep-orange" text-color="white" size="sm" class="text-weight-bold">
                    {{ cert.certificate_type?.replace('_', ' ') }}
                  </q-chip>
                  <span class="text-weight-bold text-dark">
                    Emitido em {{ formatDate(cert.createdAt) }}
                  </span>
                  <span v-if="cert.days_off" class="text-caption text-grey-7">
                    • Afastamento: {{ cert.days_off }} dia(s) {{ cert.days_off_text ? `(${cert.days_off_text})` : '' }}
                  </span>
                  <span class="text-caption text-mono text-primary text-weight-bold">
                    [Cód: {{ cert.verification_code }}]
                  </span>
                </div>

                <q-btn
                  flat
                  color="primary"
                  icon="print"
                  label="Imprimir Atestado"
                  class="btn-pill"
                  @click="printCertificate(cert)"
                />
              </q-card-section>

              <q-separator />

              <q-card-section class="q-pa-md">
                <div class="text-body2 text-dark">{{ cert.description }}</div>
                <div class="q-mt-sm">
                  <q-badge v-if="cert.cid_authorized_by_patient && cert.cid10" color="grey-8">
                    CID-10: {{ cert.cid10 }} (Autorizado pelo Paciente)
                  </q-badge>
                  <q-badge v-else color="grey-4" text-color="dark">
                    CID omitido (CFM 1.658/2002)
                  </q-badge>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Modal: Novo Atendimento / Ficha SOAP -->
    <q-dialog v-model="recordModal" persistent max-width="850px" full-width>
      <q-card class="modal-card">
        <q-card-section class="row items-center justify-between bg-primary text-white">
          <div class="text-h6 text-weight-bold">Atendimento Clínico (SOAP)</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="recordForm.record_type"
                :options="['CONSULTA', 'RETORNO', 'URGENCIA', 'TELECONSULTA']"
                outlined
                dense
                label="Tipo de Atendimento"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="recordForm.chief_complaint"
                label="Queixa Principal *"
                outlined
                dense
                placeholder="Ex: Cefaleia há 3 dias"
              />
            </div>

            <!-- Dados Vitais -->
            <div class="col-12">
              <div class="text-subtitle2 text-weight-bold text-dark q-mb-xs">Sinais Vitais</div>
            </div>
            <div class="col-6 col-sm-3">
              <q-input v-model.number="recordForm.vital_signs.systolic_bp" label="PA Sistólica (mmHg)" type="number" outlined dense />
            </div>
            <div class="col-6 col-sm-3">
              <q-input v-model.number="recordForm.vital_signs.diastolic_bp" label="PA Diastólica (mmHg)" type="number" outlined dense />
            </div>
            <div class="col-6 col-sm-3">
              <q-input v-model.number="recordForm.vital_signs.heart_rate" label="FC (bpm)" type="number" outlined dense />
            </div>
            <div class="col-6 col-sm-3">
              <q-input v-model.number="recordForm.vital_signs.temperature" label="Temp (°C)" type="number" step="0.1" outlined dense />
            </div>

            <!-- SOAP -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="recordForm.hda"
                type="textarea"
                rows="4"
                label="S - Subjetivo / HDA (História da queixa, sintomas)"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="recordForm.physical_exam"
                type="textarea"
                rows="4"
                label="O - Objetivo / Exame Físico (Achados clínicos)"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="recordForm.diagnostic_hypothesis"
                type="textarea"
                rows="3"
                label="A - Avaliação (Hipótese diagnóstica)"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="recordForm.clinical_conduct"
                type="textarea"
                rows="3"
                label="P - Plano / Conduta (Orientações, exames, medicação)"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-input v-model="recordForm.cid10" label="Código CID-10 (opcional)" outlined dense />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup class="btn-pill" />
          <q-btn
            color="primary"
            label="Finalizar Atendimento (Imutável SBIS)"
            class="btn-pill"
            :loading="store.loading"
            @click="submitRecord"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal: Nova Prescrição -->
    <q-dialog v-model="rxModal" persistent max-width="850px" full-width>
      <q-card class="modal-card">
        <q-card-section class="row items-center justify-between bg-teal text-white">
          <div class="text-h6 text-weight-bold">Emitir Prescrição Médica (ANVISA / CFM)</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="rxForm.prescription_type"
                :options="rxTypeOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                dense
                label="Tipo de Receituário *"
              />
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7 q-pt-xs">
                <span v-if="rxForm.prescription_type === 'CONTROLE_ESPECIAL'">
                  <strong>Controle Especial:</strong> Gera 2 Vias (Farmácia e Paciente), validade de 30 dias.
                </span>
                <span v-else-if="rxForm.prescription_type === 'ANTIMICROBIANO'">
                  <strong>Antimicrobiano:</strong> Validade legal de 10 dias a contar da emissão.
                </span>
                <span v-else>
                  <strong>Receita Comum:</strong> Validade padrão de 60 dias.
                </span>
              </div>
            </div>
          </div>

          <!-- Itens da Receita -->
          <div class="text-subtitle2 text-weight-bold text-dark row items-center justify-between q-mb-sm">
            <span>Medicamentos</span>
            <q-btn size="sm" color="teal" icon="add" label="Adicionar Item" class="btn-pill" @click="addRxItem" />
          </div>

          <div v-for="(item, idx) in rxForm.items" :key="idx" class="p-card bg-grey-1 q-pa-sm q-mb-sm rounded-borders">
            <div class="row q-col-gutter-sm items-center">
              <div class="col-12 col-sm-4">
                <q-input v-model="item.medication_name" label="Medicamento / Princípio Ativo *" outlined dense />
              </div>
              <div class="col-6 col-sm-3">
                <q-input v-model="item.concentration" label="Concentração (ex: 500mg)" outlined dense />
              </div>
              <div class="col-6 col-sm-4">
                <q-input v-model="item.dosage" label="Posologia (ex: 1 cp a cada 8h) *" outlined dense />
              </div>
              <div class="col-12 col-sm-1 text-center">
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  :disable="rxForm.items.length === 1"
                  @click="removeRxItem(idx)"
                />
              </div>

              <div class="col-6 col-sm-4">
                <q-input v-model="item.quantity" label="Quantidade (ex: 20 comprimidos) *" outlined dense />
              </div>
              <div class="col-6 col-sm-4">
                <q-input v-model="item.route" label="Via (ex: Oral, Tópica)" outlined dense />
              </div>
              <div class="col-12 col-sm-4">
                <q-checkbox v-model="item.continuous_use" label="Uso contínuo" dense />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup class="btn-pill" />
          <q-btn
            color="teal"
            label="Emitir Receita"
            class="btn-pill"
            :loading="store.loading"
            @click="submitPrescription"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal: Novo Atestado -->
    <q-dialog v-model="certModal" persistent max-width="600px">
      <q-card class="modal-card">
        <q-card-section class="row items-center justify-between bg-deep-orange text-white">
          <div class="text-h6 text-weight-bold">Emitir Atestado Médico</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="certForm.certificate_type"
                :options="certTypeOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                dense
                label="Tipo de Atestado *"
              />
            </div>

            <div v-if="certForm.certificate_type === 'REPOUSO_MEDICO'" class="col-12 col-sm-6">
              <q-input v-model.number="certForm.days_off" type="number" label="Dias de afastamento *" outlined dense />
            </div>

            <div class="col-12">
              <q-input
                v-model="certForm.description"
                type="textarea"
                rows="3"
                label="Texto / Justificativa do Atestado *"
                outlined
                dense
              />
            </div>

            <!-- CID com consentimento obrigatório SBIS/CFM -->
            <div class="col-12">
              <q-card flat bordered class="q-pa-sm bg-grey-1">
                <div class="text-caption text-weight-bold text-dark q-mb-xs">
                  Diagnóstico / CID-10 (Resolução CFM 1.658/2002)
                </div>
                <div class="row q-col-gutter-sm items-center">
                  <div class="col-12 col-sm-5">
                    <q-input v-model="certForm.cid10" label="Código CID-10" outlined dense />
                  </div>
                  <div class="col-12 col-sm-7">
                    <q-checkbox
                      v-model="certForm.cid_authorized_by_patient"
                      label="Paciente autorizou expressamente a inserção do CID"
                      dense
                    />
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup class="btn-pill" />
          <q-btn
            color="deep-orange"
            label="Emitir Atestado"
            class="btn-pill"
            :loading="store.loading"
            @click="submitCertificate"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de Impressão de Receita (com 2 vias para controle especial) -->
    <q-dialog v-model="printModal" max-width="800px" full-width>
      <q-card class="q-pa-md print-container">
        <div class="row justify-between items-center no-print q-mb-md">
          <div class="text-h6 text-weight-bold">Visualização de Impressão</div>
          <div>
            <q-btn color="primary" icon="print" label="Imprimir" class="btn-pill q-mr-sm" @click="printPage" />
            <q-btn flat round icon="close" v-close-popup />
          </div>
        </div>

        <div id="print-area">
          <div
            v-for="copy in getPrescriptionCopies(printData?.prescription_type)"
            :key="copy"
            class="printable-sheet q-pa-lg q-mb-md"
          >
            <!-- Cabeçalho Oficial da Clínica -->
            <div class="text-center border-bottom q-pb-md q-mb-md">
              <div class="text-h5 text-weight-bolder text-primary">
                {{ printData?.client?.name || 'CLÍNICA MÉDICA' }}
              </div>
              <div class="text-caption text-grey-8">
                CNPJ: {{ printData?.client?.cnpj || '—' }} • Endereço: {{ printData?.client?.address || '—' }}
              </div>
              <div class="text-subtitle2 text-weight-bold text-dark q-mt-xs">
                RECEITUÁRIO {{ printData?.prescription_type?.replace('_', ' ') }}
              </div>
              <div class="text-caption text-weight-bold text-teal">
                [{{ copy }}]
              </div>
            </div>

            <!-- Dados do Paciente -->
            <div class="border-box q-pa-sm q-mb-md">
              <div><strong>Paciente:</strong> {{ printData?.patient?.name }}</div>
              <div>
                <strong>CPF:</strong> {{ printData?.patient?.cpf || 'Não informado' }} &nbsp;|&nbsp;
                <strong>CNS:</strong> {{ printData?.patient?.cns || 'Não informado' }}
              </div>
            </div>

            <!-- Medicamentos -->
            <div class="q-my-lg">
              <div
                v-for="(item, idx) in printData?.items"
                :key="idx"
                class="q-mb-md"
              >
                <div class="text-weight-bolder text-dark">
                  {{ idx + 1 }}. {{ item.medication_name }} {{ item.concentration ? `(${item.concentration})` : '' }} ----------------- {{ item.quantity }}
                </div>
                <div class="q-pl-md text-body2 text-grey-9">
                  Posologia: {{ item.dosage }} (Via {{ item.route || 'Oral' }})
                </div>
              </div>
            </div>

            <!-- Rodapé com Identificação do Médico e Validação -->
            <div class="q-mt-xl pt-lg border-top row items-center justify-between">
              <div>
                <div class="text-weight-bold">
                  {{ printData?.professional?.user?.name || 'Médico Responsável' }}
                </div>
                <div class="text-caption">
                  {{ printData?.professional?.council?.code || 'CRM' }}: {{ printData?.professional?.council_number }}/{{ printData?.professional?.council_uf }}
                </div>
                <div class="text-caption text-grey-7">
                  Data: {{ formatDate(printData?.createdAt) }} • Válido até: {{ formatDate(printData?.expires_at) }}
                </div>
              </div>

              <div class="text-right">
                <div class="text-caption text-grey-8">Código Verificador:</div>
                <div class="text-mono text-weight-bolder text-primary">
                  {{ printData?.verification_code }}
                </div>
                <div class="text-caption text-grey-6">Validação pública online</div>
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useMedicalRecordStore } from '../stores/medical-record';
import { usePatientsStore, type Patient } from '../stores/patients';

const route = useRoute();
const $q = useQuasar();
const store = useMedicalRecordStore();
const patientsStore = usePatientsStore();

const activeTab = ref('records');
const patient = ref<Patient | null>(null);

const records = computed(() => store.records);
const prescriptions = computed(() => store.prescriptions);
const certificates = computed(() => store.certificates);
const loading = computed(() => store.loading);

// Modais
const recordModal = ref(false);
const rxModal = ref(false);
const certModal = ref(false);
const printModal = ref(false);
const printData = ref<any>(null);

const rxTypeOptions = [
  { label: 'Receita Simples (Comum)', value: 'SIMPLES' },
  { label: 'Controle Especial (2 Vias)', value: 'CONTROLE_ESPECIAL' },
  { label: 'Antimicrobiano (10 dias)', value: 'ANTIMICROBIANO' },
];

const certTypeOptions = [
  { label: 'Atestado de Repouso Médico', value: 'REPOUSO_MEDICO' },
  { label: 'Declaração de Comparecimento', value: 'COMPARECIMENTO' },
  { label: 'Atestado de Aptidão Física', value: 'APTIDAO_FISICA' },
  { label: 'Atestado de Acompanhante', value: 'ACOMPANHANTE' },
];

// Forms
const activeRecordId = ref<number | null>(null);
const recordForm = ref({
  record_type: 'CONSULTA',
  chief_complaint: '',
  hda: '',
  physical_exam: '',
  diagnostic_hypothesis: '',
  cid10: '',
  clinical_conduct: '',
  vital_signs: {
    systolic_bp: undefined as number | undefined,
    diastolic_bp: undefined as number | undefined,
    heart_rate: undefined as number | undefined,
    temperature: undefined as number | undefined,
  },
});

const rxForm = ref({
  prescription_type: 'SIMPLES',
  items: [
    { medication_name: '', concentration: '', dosage: '', quantity: '', route: 'Oral', continuous_use: false },
  ],
});

const certForm = ref({
  certificate_type: 'REPOUSO_MEDICO',
  days_off: 1,
  description: '',
  cid10: '',
  cid_authorized_by_patient: false,
});

onMounted(async () => {
  const patientId = Number(route.params['id']);
  if (patientId) {
    try {
      patient.value = await patientsStore.fetchById(patientId);
      await Promise.all([
        store.fetchRecords(patientId),
        store.fetchPrescriptions(patientId),
        store.fetchCertificates(patientId),
      ]);
    } catch {
      $q.notify({ type: 'negative', message: 'Erro ao carregar dados do prontuário.' });
    }
  }
});

function openNewRecordModal() {
  activeRecordId.value = null;
  recordForm.value = {
    record_type: 'CONSULTA',
    chief_complaint: '',
    hda: '',
    physical_exam: '',
    diagnostic_hypothesis: '',
    cid10: '',
    clinical_conduct: '',
    vital_signs: {
      systolic_bp: undefined,
      diastolic_bp: undefined,
      heart_rate: undefined,
      temperature: undefined,
    },
  };
  recordModal.value = true;
}

function resumeRecord(rec: any) {
  activeRecordId.value = rec.id;
  recordForm.value = {
    record_type: rec.record_type || 'CONSULTA',
    chief_complaint: rec.chief_complaint || '',
    hda: rec.hda || '',
    physical_exam: rec.physical_exam || '',
    diagnostic_hypothesis: rec.diagnostic_hypothesis || '',
    cid10: rec.cid10 || '',
    clinical_conduct: rec.clinical_conduct || '',
    vital_signs: { ...(rec.vital_signs || {}) },
  };
  recordModal.value = true;
}

async function submitRecord() {
  const patientId = Number(route.params['id']);
  try {
    if (activeRecordId.value) {
      await store.finishRecord(activeRecordId.value, {
        cid10: recordForm.value.cid10,
        clinical_conduct: recordForm.value.clinical_conduct,
      });
    } else {
      const created = await store.createRecord({
        patient_id: patientId,
        record_type: recordForm.value.record_type,
        chief_complaint: recordForm.value.chief_complaint,
        hda: recordForm.value.hda,
        physical_exam: recordForm.value.physical_exam,
        diagnostic_hypothesis: recordForm.value.diagnostic_hypothesis,
        vital_signs: recordForm.value.vital_signs,
        cid10: recordForm.value.cid10,
        clinical_conduct: recordForm.value.clinical_conduct,
      });
      await store.finishRecord(created.id, {
        cid10: recordForm.value.cid10,
        clinical_conduct: recordForm.value.clinical_conduct,
      });
    }
    $q.notify({ type: 'positive', message: 'Atendimento finalizado com sucesso!' });
    recordModal.value = false;
    await store.fetchRecords(patientId);
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err?.response?.data?.message || 'Erro ao salvar atendimento.' });
  }
}

function openNewPrescriptionModal() {
  rxForm.value = {
    prescription_type: 'SIMPLES',
    items: [
      { medication_name: '', concentration: '', dosage: '', quantity: '', route: 'Oral', continuous_use: false },
    ],
  };
  rxModal.value = true;
}

function addRxItem() {
  rxForm.value.items.push({
    medication_name: '',
    concentration: '',
    dosage: '',
    quantity: '',
    route: 'Oral',
    continuous_use: false,
  });
}

function removeRxItem(index: number) {
  rxForm.value.items.splice(index, 1);
}

async function submitPrescription() {
  const patientId = Number(route.params['id']);
  try {
    await store.createPrescription({
      patient_id: patientId,
      ...rxForm.value,
    });
    $q.notify({ type: 'positive', message: 'Prescrição emitida com sucesso!' });
    rxModal.value = false;
    await store.fetchPrescriptions(patientId);
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err?.response?.data?.message || 'Erro ao emitir prescrição.' });
  }
}

function openNewCertificateModal() {
  certForm.value = {
    certificate_type: 'REPOUSO_MEDICO',
    days_off: 1,
    description: 'Atesto para os devidos fins que o paciente necessita de repouso por motivo de saúde.',
    cid10: '',
    cid_authorized_by_patient: false,
  };
  certModal.value = true;
}

async function submitCertificate() {
  const patientId = Number(route.params['id']);
  try {
    await store.createCertificate({
      patient_id: patientId,
      ...certForm.value,
    });
    $q.notify({ type: 'positive', message: 'Atestado emitido com sucesso!' });
    certModal.value = false;
    await store.fetchCertificates(patientId);
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err?.response?.data?.message || 'Erro ao emitir atestado.' });
  }
}

async function openPrintModal(rxId: number) {
  try {
    printData.value = await store.getPrescriptionPrint(rxId);
    printModal.value = true;
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar dados de impressão.' });
  }
}

function getPrescriptionCopies(type?: string): string[] {
  if (type === 'CONTROLE_ESPECIAL') {
    return ['1ª VIA - FARMÁCIA (RETENÇÃO)', '2ª VIA - PACIENTE (ORIENTAÇÃO)'];
  }
  return ['1ª VIA - PACIENTE'];
}

function printCertificate(cert: any) {
  $q.notify({
    type: 'info',
    message: `Atestado Cód: ${cert.verification_code} pronto para impressão.`,
  });
  window.print();
}

function printPage() {
  window.print();
}

function formatDate(val?: string) {
  if (!val) return '—';
  const parts = val.split('T')[0]?.split('-');
  return parts && parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : val;
}

function formatDateTime(val?: string) {
  if (!val) return '—';
  const d = new Date(val);
  return d.toLocaleString('pt-BR');
}

function formatGender(val?: string) {
  if (val === 'M') return 'Masculino';
  if (val === 'F') return 'Feminino';
  return 'Indeterminado';
}

function getPrescriptionColor(type: string) {
  if (type === 'CONTROLE_ESPECIAL') return 'deep-orange';
  if (type === 'ANTIMICROBIANO') return 'purple';
  return 'primary';
}
</script>

<style scoped>
.patient-record-page {
  max-width: 1200px;
  margin: 0 auto;
}

.rounded-card {
  border-radius: 16px;
}

.record-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.btn-pill {
  border-radius: 999px !important;
  font-weight: 600;
  transition: transform 0.15s ease;
}

.btn-pill:active {
  transform: scale(0.97);
}

.soap-box {
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px;
  border-left: 4px solid #cbd5e1;
}

.soap-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.soap-badge.subjective { color: #0284c7; }
.soap-badge.objective { color: #16a34a; }
.soap-badge.assessment { color: #ca8a04; }
.soap-badge.plan { color: #9333ea; }

.soap-content {
  font-size: 0.875rem;
  color: #334155;
  white-space: pre-line;
}

.printable-sheet {
  border: 1px dashed #cbd5e1;
  background: white;
}

@media print {
  .no-print {
    display: none !important;
  }
  .printable-sheet {
    border: none !important;
    page-break-after: always;
  }
}
</style>
