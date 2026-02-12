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
    path: '/admin',
    component: () => import('../views/admin/AdminDashboardPage.vue')
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

export default router
