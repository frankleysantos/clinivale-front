import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/api';

export interface Patient {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
  cellphone: string;
  email: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  occupation?: string;
  client?: { id: number; name: string };
}

export interface CreatePatientDto {
  client_id?: number;
  name: string;
  cpf: string;
  birthDate: string;
  cellphone: string;
  email: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  occupation?: string;
}

export const usePatientsStore = defineStore('patients', () => {
  const patients = ref<Patient[]>([]);
  const loading = ref(false);
  const selected = ref<Patient | null>(null);

  async function fetchAll() {
    loading.value = true;
    try {
      const { data } = await api.get<Patient[]>('/patient');
      patients.value = data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: number) {
    loading.value = true;
    try {
      const { data } = await api.get<Patient>(`/patient/${id}`);
      selected.value = data;
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function create(dto: CreatePatientDto) {
    const { data } = await api.post<Patient>('/patient/create', dto);
    patients.value.push(data);
    return data;
  }

  async function update(id: number, dto: Partial<CreatePatientDto>) {
    const { data } = await api.patch<Patient>(`/patient/${id}/update`, dto);
    const index = patients.value.findIndex((p) => p.id === id);
    if (index !== -1) patients.value[index] = data;
    return data;
  }

  async function remove(id: number) {
    await api.delete(`/patient/${id}/delete`);
    patients.value = patients.value.filter((p) => p.id !== id);
  }

  return {
    patients,
    loading,
    selected,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
  };
});
