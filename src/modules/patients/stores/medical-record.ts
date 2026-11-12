import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/api';

export type MedicalRecordStatus = 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';
export type PrescriptionType = 'SIMPLES' | 'CONTROLE_ESPECIAL' | 'ANTIMICROBIANO';
export type CertificateType = 'REPOUSO_MEDICO' | 'COMPARECIMENTO' | 'APTIDAO_FISICA' | 'ACOMPANHANTE';

export interface VitalSigns {
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  temperature?: number;
  spo2?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface MedicalRecord {
  id: number;
  client_id: number;
  patient_id: number;
  professional_id: number;
  record_type: string;
  status: MedicalRecordStatus;
  chief_complaint?: string;
  hda?: string;
  past_history?: string;
  family_history?: string;
  physical_exam?: string;
  vital_signs?: VitalSigns;
  diagnostic_hypothesis?: string;
  cid10?: string;
  clinical_conduct?: string;
  started_at: string;
  finished_at?: string;
  professional?: {
    id: number;
    user?: { name: string };
    council_number?: string;
    council_uf?: string;
    profession?: { name: string };
    council?: { code: string };
  };
  prescriptions?: Prescription[];
  certificates?: MedicalCertificate[];
}

export interface PrescriptionItem {
  id?: number;
  medication_name: string;
  concentration?: string;
  pharmaceutical_form?: string;
  dosage: string;
  quantity: string;
  route?: string;
  continuous_use?: boolean;
}

export interface Prescription {
  id: number;
  client_id: number;
  patient_id: number;
  professional_id: number;
  medical_record_id?: number;
  prescription_type: PrescriptionType;
  observations?: string;
  status: string;
  verification_code: string;
  expires_at: string;
  createdAt: string;
  items: PrescriptionItem[];
  professional?: {
    id: number;
    user?: { name: string };
    council_number?: string;
    council_uf?: string;
    profession?: { name: string };
    council?: { code: string };
  };
  client?: {
    id: number;
    name: string;
    cnpj?: string;
    cellphone?: string;
    address?: string;
  };
}

export interface MedicalCertificate {
  id: number;
  client_id: number;
  patient_id: number;
  professional_id: number;
  medical_record_id?: number;
  certificate_type: CertificateType;
  days_off?: number;
  days_off_text?: string;
  cid10?: string;
  cid_authorized_by_patient: boolean;
  description: string;
  verification_code: string;
  createdAt: string;
  professional?: {
    id: number;
    user?: { name: string };
    council_number?: string;
    council_uf?: string;
    profession?: { name: string };
    council?: { code: string };
  };
}

export const useMedicalRecordStore = defineStore('medicalRecord', () => {
  const records = ref<MedicalRecord[]>([]);
  const currentRecord = ref<MedicalRecord | null>(null);
  const prescriptions = ref<Prescription[]>([]);
  const certificates = ref<MedicalCertificate[]>([]);
  const loading = ref(false);

  // Atendimentos PEP
  async function fetchRecords(patientId: number, clientId?: number) {
    loading.value = true;
    try {
      const res = await api.get(`/medical-records/patient/${patientId}`, {
        params: clientId ? { client_id: clientId } : undefined,
      });
      records.value = res.data;
      return res.data;
    } finally {
      loading.value = false;
    }
  }

  async function createRecord(payload: any) {
    loading.value = true;
    try {
      const res = await api.post('/medical-records', payload);
      records.value.unshift(res.data);
      currentRecord.value = res.data;
      return res.data;
    } finally {
      loading.value = false;
    }
  }

  async function finishRecord(id: number, payload: any) {
    loading.value = true;
    try {
      const res = await api.patch(`/medical-records/${id}/finish`, payload);
      const index = records.value.findIndex((r) => r.id === id);
      if (index !== -1) {
        records.value[index] = res.data;
      }
      currentRecord.value = res.data;
      return res.data;
    } finally {
      loading.value = false;
    }
  }

  // Prescrições
  async function fetchPrescriptions(patientId: number, clientId?: number) {
    loading.value = true;
    try {
      const res = await api.get(`/medical-records/prescriptions/patient/${patientId}`, {
        params: clientId ? { client_id: clientId } : undefined,
      });
      prescriptions.value = res.data;
      return res.data;
    } finally {
      loading.value = false;
    }
  }

  async function createPrescription(payload: any) {
    loading.value = true;
    try {
      const res = await api.post('/medical-records/prescriptions', payload);
      prescriptions.value.unshift(res.data);
      return res.data;
    } finally {
      loading.value = false;
    }
  }

  async function getPrescriptionPrint(id: number) {
    const res = await api.get(`/medical-records/prescriptions/${id}/print`);
    return res.data;
  }

  // Atestados
  async function fetchCertificates(patientId: number, clientId?: number) {
    loading.value = true;
    try {
      const res = await api.get(`/medical-records/certificates/patient/${patientId}`, {
        params: clientId ? { client_id: clientId } : undefined,
      });
      certificates.value = res.data;
      return res.data;
    } finally {
      loading.value = false;
    }
  }

  async function createCertificate(payload: any) {
    loading.value = true;
    try {
      const res = await api.post('/medical-records/certificates', payload);
      certificates.value.unshift(res.data);
      return res.data;
    } finally {
      loading.value = false;
    }
  }

  return {
    records,
    currentRecord,
    prescriptions,
    certificates,
    loading,
    fetchRecords,
    createRecord,
    finishRecord,
    fetchPrescriptions,
    createPrescription,
    getPrescriptionPrint,
    fetchCertificates,
    createCertificate,
  };
});
