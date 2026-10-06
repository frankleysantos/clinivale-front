import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/api';

export type ClientType = 'FISICA' | 'JURIDICA';
export type ClientStatus = 'ATIVO' | 'INATIVO';

export interface Client {
  id: number;
  name: string;
  cpf?: string;
  cnpj?: string;
  type: ClientType;
  cellphone?: string;
  city?: string;
  state?: string;
  email?: string;
  status: ClientStatus;
}

export interface CreateClientDto {
  name: string;
  cpf?: string;
  cnpj?: string;
  type: ClientType;
  cellphone?: string;
  city?: string;
  state?: string;
  email?: string;
  status?: ClientStatus;
}

export const useClientsStore = defineStore('clients', () => {
  const clients = ref<Client[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      const { data } = await api.get<Client[]>('/clients');
      clients.value = data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: number) {
    const { data } = await api.get<Client>(`/clients/${id}`);
    return data;
  }

  async function create(dto: CreateClientDto) {
    const { data } = await api.post<Client>('/clients/create', dto);
    clients.value.push(data);
    return data;
  }

  async function update(id: number, dto: Partial<CreateClientDto>) {
    const { data } = await api.patch<Client>(`/clients/${id}`, dto);
    const index = clients.value.findIndex((c) => c.id === id);
    if (index !== -1) clients.value[index] = data;
    return data;
  }

  async function remove(id: number) {
    await api.delete(`/clients/${id}`);
    clients.value = clients.value.filter((c) => c.id !== id);
  }

  return { clients, loading, fetchAll, fetchOne, create, update, remove };
});
