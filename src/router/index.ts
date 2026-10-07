import { defineRouter } from '#q-app';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  // Navigation guard — protege rotas que requerem autenticação
  Router.beforeEach((to) => {
    const token = localStorage.getItem('access_token');
    const requiresAuth = to.matched.some((r) => r.meta['requiresAuth']);

    if (requiresAuth && !token) {
      return { name: 'login' };
    }
    if (to.name === 'login' && token) {
      return { name: 'dashboard' };
    }
  });

  return Router;
});
