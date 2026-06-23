import { createRouter as createVueRouter, createWebHistory } from 'vue-router';
import { AuthService } from '@/services/auth.service';
import ClientView from '../views/ClientsView.vue';
import InvoiceView from '../views/InvoicesView.vue';
import LoginView from '../views/LoginView.vue';
import PrestationView from '../views/PrestationsView.vue';
import type { Router } from 'vue-router';

const routes: Array<import('vue-router').RouteRecordRaw> = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
    meta: { public: true },
  },
  {
    path: '/invoices',
    name: 'invoices',
    component: InvoiceView,
  },
  {
    path: '/clients',
    name: 'clients',
    component: ClientView,
  },
  {
    path: '/prestations',
    name: 'prestations',
    component: PrestationView,
  },
];

export function createRouter(): Router {
  const router = createVueRouter({
    history: createWebHistory(),
    routes,
  });

  router.beforeEach((to, _from, next) => {
    const isPublic = to.meta.public;
    const isAuthenticated = AuthService.isAuthenticated();

    if (isPublic && isAuthenticated) {
      // If user is authenticated and tries to access a public page (like login),
      // redirect them to the home page.
      return next({ name: 'invoices' });
    }

    if (!isPublic && !isAuthenticated) {
      // If the route is not public and the user is not authenticated,
      // redirect them to the login page.
      return next({ name: 'login' });
    }

    // Otherwise, allow navigation.
    next();
  });

  return router;
}
