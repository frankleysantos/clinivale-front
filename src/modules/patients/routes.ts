import type { RouteRecordRaw } from 'vue-router';

export const patientRoutes: RouteRecordRaw[] = [
  {
    path: 'pacientes',
    name: 'patients',
    component: () => import('@/modules/patients/pages/PatientsPage.vue'),
    meta: { requiresAuth: true, title: 'Pacientes' },
  },
  {
    path: 'pacientes/novo',
    name: 'patient-create',
    component: () => import('@/modules/patients/pages/PatientFormPage.vue'),
    meta: { requiresAuth: true, title: 'Novo Paciente' },
  },
  {
    path: 'pacientes/:id/editar',
    name: 'patient-edit',
    component: () => import('@/modules/patients/pages/PatientFormPage.vue'),
    meta: { requiresAuth: true, title: 'Editar Paciente' },
  },
  {
    path: 'pacientes/:id/prontuario',
    name: 'patient-record',
    component: () => import('@/modules/patients/pages/PatientRecordPage.vue'),
    meta: { requiresAuth: true, title: 'Prontuário do Paciente' },
  },
];
