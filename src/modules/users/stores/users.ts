import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/api';

export interface CouncilItem {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: string;
}

export interface ProfessionItem {
  id: number;
  name: string;
  council_id?: number | null;
  description?: string;
  status: string;
  council?: CouncilItem | null;
}

export interface SpecialtyItem {
  id: number;
  name: string;
  profession_id: number;
  description?: string;
  status: string;
}

export interface ProfessionalData {
  id?: number;
  user_id?: number;
  client_id?: number;
  profession_id: number;
  council_id?: number | null;
  council_number: string;
  council_uf: string;
  specialty_ids?: number[];
  profession?: ProfessionItem | null;
  council?: CouncilItem | null;
  specialties?: SpecialtyItem[];
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  client: { id: number; name: string };
  roles: Array<{ id: number; name: string; client_id?: number }>;
  professional?: ProfessionalData | null;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  role_ids?: number[];
  client_id?: number;
  is_health_professional?: boolean;
  professional?: ProfessionalData;
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserItem[]>([]);
  const loading = ref(false);
  const councils = ref<CouncilItem[]>([]);
  const professions = ref<ProfessionItem[]>([]);
  const specialties = ref<SpecialtyItem[]>([]);

  async function fetchAll(clientId?: number | string) {
    loading.value = true;
    try {
      const { data } = await api.get<UserItem[]>('/users', {
        params: clientId !== undefined && clientId !== null && clientId !== '' ? { client_id: clientId } : {},
      });
      users.value = data;
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: number) {
    const { data } = await api.get<UserItem>(`/users/${id}`);
    return data;
  }

  async function fetchCouncils() {
    try {
      const { data } = await api.get<CouncilItem[]>('/professionals/councils');
      councils.value = data;
      return data;
    } catch {
      return [];
    }
  }

  async function fetchProfessions() {
    try {
      const { data } = await api.get<ProfessionItem[]>('/professionals/professions');
      professions.value = data;
      return data;
    } catch {
      return [];
    }
  }

  async function fetchSpecialties(professionId?: number) {
    try {
      const { data } = await api.get<SpecialtyItem[]>('/professionals/specialties', {
        params: professionId ? { profession_id: professionId } : {},
      });
      specialties.value = data;
      return data;
    } catch {
      return [];
    }
  }

  async function create(dto: CreateUserDto) {
    const { data } = await api.post<UserItem>('/users/create', dto);
    users.value.push(data);
    return data;
  }

  async function update(id: number, dto: Partial<CreateUserDto>) {
    const { data } = await api.patch<UserItem>(`/users/${id}/update`, dto);
    const index = users.value.findIndex((u) => u.id === id);
    if (index !== -1) users.value[index] = data;
    return data;
  }

  async function remove(id: number) {
    await api.delete(`/users/${id}/delete`);
    users.value = users.value.filter((u) => u.id !== id);
  }

  return {
    users,
    loading,
    councils,
    professions,
    specialties,
    fetchAll,
    fetchOne,
    fetchCouncils,
    fetchProfessions,
    fetchSpecialties,
    create,
    update,
    remove,
  };
});
