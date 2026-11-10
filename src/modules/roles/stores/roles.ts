import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/api';

export interface PermissionRule {
  controller: string;
  method: string;
}

export interface RoleItem {
  id: number;
  name: string;
  permissions: PermissionRule[];
  client_id?: number | null;
  client?: { id: number; name: string };
}

export interface AvailablePermissionGroup {
  controller: string;
  label: string;
  methods: Array<{ name: string; label: string }>;
}

export interface CreateRoleDto {
  name: string;
  permissions: PermissionRule[];
  client_id?: number;
}

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<RoleItem[]>([]);
  const availablePermissions = ref<AvailablePermissionGroup[]>([]);
  const loading = ref(false);

  async function fetchAll(clientId?: number) {
    loading.value = true;
    try {
      const { data } = await api.get<RoleItem[]>('/roles', {
        params: clientId ? { client_id: clientId } : {},
      });
      roles.value = data;
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAvailablePermissions() {
    try {
      const { data } = await api.get<AvailablePermissionGroup[]>('/roles/available-permissions');
      availablePermissions.value = data;
      return data;
    } catch {
      return [];
    }
  }

  async function fetchOne(id: number) {
    const { data } = await api.get<RoleItem>(`/roles/${id}`);
    return data;
  }

  async function create(dto: CreateRoleDto) {
    const { data } = await api.post<RoleItem>('/roles/create', dto);
    roles.value.push(data);
    return data;
  }

  async function update(id: number, dto: Partial<CreateRoleDto>) {
    const { data } = await api.patch<RoleItem>(`/roles/${id}`, dto);
    const index = roles.value.findIndex((r) => r.id === id);
    if (index !== -1) roles.value[index] = data;
    return data;
  }

  async function remove(id: number) {
    await api.delete(`/roles/${id}`);
    roles.value = roles.value.filter((r) => r.id !== id);
  }

  return {
    roles,
    availablePermissions,
    loading,
    fetchAll,
    fetchAvailablePermissions,
    fetchOne,
    create,
    update,
    remove,
  };
});
