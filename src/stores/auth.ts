import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/api';

export interface Client {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  client?: Client;
  clients?: Client[];
  roles: Array<{
    id: number;
    name: string;
    permissions: Array<{ controller: string; method: string }>;
  }>;
}

export interface AuthResponse {
  user?: User | null;
  access_token?: string | null;
  requires_client_selection?: boolean;
  clients?: Client[];
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(
    JSON.parse(localStorage.getItem('user') ?? 'null'),
  );
  const access_token = ref<string | null>(
    localStorage.getItem('access_token'),
  );

  const isAuthenticated = computed(() => !!access_token.value);
  const userName = computed(() => user.value?.name ?? '');
  const clientName = computed(() => user.value?.client?.name ?? '');

  async function login(email: string, password: string, clientId?: number) {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
      ...(clientId ? { client_id: clientId } : {}),
    });

    if (data.requires_client_selection) {
      return data;
    }

    if (data.access_token && data.user) {
      access_token.value = data.access_token;
      user.value = data.user as User;

      localStorage.setItem('access_token', data.access_token ?? '');
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  async function fetchMe() {
    const { data } = await api.get<AuthResponse>('/auth/me');
    if (data.user) {
      user.value = data.user as User;
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  function logout() {
    user.value = null;
    access_token.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  return {
    user,
    access_token,
    isAuthenticated,
    userName,
    clientName,
    login,
    fetchMe,
    logout,
  };
});

