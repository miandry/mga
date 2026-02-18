import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('../views/auth/LoginPage.vue')
  },
  {
    path: '/dashboard',
    component: () => import('../views/dashboard/DashboardPage.vue')
  },
  {
    path: '/transfer',
    component: () => import('../views/transfer/TransferFormPage.vue')
  },
  {
    path: '/transfer/upload',
    component: () => import('../views/transfer/UploadProofPage.vue')
  },
  {
    path: '/transfer/qrcode',
    component: () => import('../views/transfer/QRUploadPage.vue')
  },
  {
    path: '/transactions',
    component: () => import('../views/transactions/HistoryPage.vue')
  },
  {
    path: '/transaction/:id',
    component: () => import('../views/transactions/TransactionDetailPage.vue')
  },
  {
    path: '/transaction/qr/:id',
    component: () => import('../views/transactions/QRCodePage.vue')
  },
  {
    path: '/manage',
    component: () => import('../views/admin/AdminDashboardPage.vue')
  },
  {
    path: '/manage/generate-visitor',
    component: () => import('../views/admin/GenerateVisitorPage.vue')
  },
  {
    path: '/manage/rate',
    component: () => import('../views/admin/ManageRatePage.vue')
  },
  {
    path: '/profile',
    component: () => import('../views/profile/ProfilePage.vue')
  },
  {
    path: '/notifications',
    component: () => import('../views/NotificationsPage.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Initialize auth store if not already done
  if (!authStore.isAuthenticated && localStorage.getItem('user')) {
    authStore.init();
  }

  const publicPaths = ['/auth/login'];
  const isPublicPath = publicPaths.includes(to.path);
  const hasToken = to.query.token;

  // Special case for /transfer: allow if has token or is authenticated
  if (to.path.startsWith('/transfer')) {
    if (hasToken || authStore.isAuthenticated) {
      return next();
    }
    return next('/auth/login');
  }

  if (!authStore.isAuthenticated && !isPublicPath) {
    return next('/auth/login');
  }

  next();
});

export default router
