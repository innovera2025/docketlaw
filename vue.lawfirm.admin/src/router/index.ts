import BlankPage from '@/views/blank-page.vue'
import LoginPage from '@/views/login-page.vue'
import { createRouter, createWebHistory } from 'vue-router'
import AdminPage from '@/views/admin/admin-page.vue'
import AdminDetail from '@/views/admin/admin-detail.vue'
import CustomerPage from '@/views/customer/customer-page.vue'
import CustomerDetail from '@/views/customer/customer-detail.vue'

import overviewRoutes from './modules/overviewRoutes'
import paymentRoutes from './modules/paymentRoutes'
import packageRoutes from './modules/packageRoutes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...overviewRoutes,
    ...paymentRoutes,
    ...packageRoutes,
    {
      path: '/:catchAll(.*)',
      component: BlankPage,
      meta: {
        pages: ['Law Firm Legal Management'],
        routes: [],
      },
    },
    {
      path: '/login',
      component: LoginPage,
    },
    {
      path: '/admin',
      children: [
        {
          path: '',
          component: AdminPage,
          meta: {
            pages: ['ผู้ดูแลระบบ'],
            routes: [],
          },
        },
        {
          path: ':id',
          component: AdminDetail,
          meta: {
            pages: ['ผู้ดูแลระบบ', 'รายละเอียดผู้ดูแลระบบ'],
            routes: ['/admin', ''],
          },
        },
      ],
    },
    {
      path: '/customer',
      children: [
        {
          path: '',
          component: CustomerPage,
          meta: {
            pages: ['ข้อมูลสมาชิก'],
            routes: [],
          },
        },
        {
          path: ':id',
          component: CustomerDetail,
          meta: {
            pages: ['ข้อมูลสมาชิก', 'รายละเอียดสมาชิก'],
            routes: ['/customer', ''],
          },
        },
      ],
    },
  ],
})

router.afterEach((to, from) => {
  // runs every single time route changes
  // console.log('navigated from', from.fullPath, 'to', to.fullPath)
  // your script here
})

export default router
