import type { RouteRecordRaw } from 'vue-router';

export const clientRoutes: RouteRecordRaw[] = [
  {
    path: 'clientes',
    name: 'clients',
    component: () => import('@/modules/clients/pages/ClientsPage.vue'),
    meta: { requiresAuth: true, title: 'Clientes' },
  },
];
