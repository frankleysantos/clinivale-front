import type { RouteRecordRaw } from 'vue-router';
import { authRoutes } from '@/modules/auth/routes';
import { dashboardRoutes } from '@/modules/dashboard/routes';
import { patientRoutes } from '@/modules/patients/routes';
import { userRoutes } from '@/modules/users/routes';
import { roleRoutes } from '@/modules/roles/routes';
import { clientRoutes } from '@/modules/clients/routes';

const routes: RouteRecordRaw[] = [
  // Rotas de autenticação (sem sidebar / AuthLayout)
  ...authRoutes,

  // Rotas protegidas (com sidebar / MainLayout)
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'dashboard' },
      },
      ...dashboardRoutes,
      ...patientRoutes,
      ...userRoutes,
      ...roleRoutes,
      ...clientRoutes,
    ],
  },

  // 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
