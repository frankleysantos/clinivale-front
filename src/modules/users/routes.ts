import type { RouteRecordRaw } from 'vue-router';

export const userRoutes: RouteRecordRaw[] = [
  {
    path: 'usuarios',
    name: 'users',
    component: () => import('@/modules/users/pages/UsersPage.vue'),
    meta: { requiresAuth: true, title: 'Usuários' },
  },
];
