import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Rotas de autenticação (sem sidebar)
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
        meta: { public: true },
      },
    ],
  },

  // Rotas protegidas (com sidebar)
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'dashboard' },
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
        meta: { requiresAuth: true, title: 'Dashboard' },
      },
      // Pacientes
      {
        path: 'pacientes',
        name: 'patients',
        component: () => import('@/pages/PatientsPage.vue'),
        meta: { requiresAuth: true, title: 'Pacientes' },
      },
      {
        path: 'pacientes/novo',
        name: 'patient-create',
        component: () => import('@/pages/PatientFormPage.vue'),
        meta: { requiresAuth: true, title: 'Novo Paciente' },
      },
      {
        path: 'pacientes/:id/editar',
        name: 'patient-edit',
        component: () => import('@/pages/PatientFormPage.vue'),
        meta: { requiresAuth: true, title: 'Editar Paciente' },
      },
      // Usuários
      {
        path: 'usuarios',
        name: 'users',
        component: () => import('@/pages/UsersPage.vue'),
        meta: { requiresAuth: true, title: 'Usuários' },
      },
      // Clientes
      {
        path: 'clientes',
        name: 'clients',
        component: () => import('@/pages/ClientsPage.vue'),
        meta: { requiresAuth: true, title: 'Clientes' },
      },
    ],
  },

  // 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
