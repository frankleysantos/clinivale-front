import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/api';

export interface UserItem {
  id: number;
  name: string;
  email: string;
  client: { id: number; name: string };
  roles: Array<{ id: number; name: string }>;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserItem[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      const { data } = await api.get<UserItem[]>('/users');
      users.value = data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: number) {
    const { data } = await api.get<UserItem>(`/users/${id}`);
    return data;
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

  return { users, loading, fetchAll, fetchOne, create, update, remove };
});
