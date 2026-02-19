import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/auth/login',
    component: () => import('../views/auth/LoginPage.vue')
  },
  {
    path: '/dashboard',
    component: () => import('../views/dashboard/DashboardPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/transfer',
    component: () => import('../views/transfer/TransferFormPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/transfer/upload',
    component: () => import('../views/transfer/UploadProofPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    component: () => import('../views/transactions/HistoryPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/transaction/:id',
    component: () => import('../views/transactions/TransactionDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/transaction/qr/:id',
    component: () => import('../views/transactions/QRCodePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminDashboardPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    component: () => import('../views/profile/ProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    component: () => import('../views/NotificationsPage.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  // Si la route nécessite auth et pas connecté
  if (to.meta.requiresAuth && !token) {
    next('/auth/login');
  }
  // Si connecté et essaie d'aller sur login
  else if (to.path === '/auth/login' && token) {
    next('/dashboard');
  }
  else {
    next();
  }
});

export default router;
