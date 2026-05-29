import BlankPage from '@/views/blank-page.vue'
import LoginPage from '@/views/login-page.vue'
import RegisterPage from '@/views/register-page.vue'
import ForgetPasswordPage from '@/views/forget-password-page.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'
import CasesPage from '@/views/cases/cases-page.vue'
import CasesCreate from '@/views/cases/cases-create.vue'
import CasesDetail from '@/views/cases/cases-detail.vue'
import CaseStepsPage from '@/views/cases/case-steps-page.vue'
import PackagesPage from '@/views/packages/packages-page.vue'
import StoragePage from '@/views/storage/storage-page.vue'
import CalendarPage from '@/views/calendar/calendar-page.vue'
import profileDetail from '@/views/profile/profile-detail.vue'
import OcrPage from '@/views/ocr/ocr-page.vue'
import OverviewPage from '@/views/overview/overview-page.vue'

import employeeRoutes from './modules/employeeRoutes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...employeeRoutes,
    {
      path: '/:catchAll(.*)',
      component: BlankPage,
      meta: {
        pages: ['Docket Law Legal Management'],
        routes: [],
      },
    },
    {
      path: '/login',
      component: LoginPage,
    },
    {
      path: '/register',
      component: RegisterPage,
    },
    {
      path: '/forget-password',
      component: ForgetPasswordPage,
    },
    {
      path: '/calendar',
      component: CalendarPage,
      meta: {
        pages: ['ปฏิทินนัดหมาย'],
        routes: [],
      },
    },
    {
      path: '/overview',
      component: OverviewPage,
      meta: {
        pages: ['ภาพรวมและรายงาน'],
        routes: [],
      },
    },
    {
      path: '/cases',
      component: CasesPage,
      meta: {
        pages: ['แฟ้มคดี | รายการคดี'],
        routes: [],
      },
    },
    {
      path: '/cases/add',
      component: CasesCreate,
      meta: {
        pages: ['แฟ้มคดี | รายการคดี', 'เพิ่มข้อมูลคดีใหม่'],
        routes: ['/cases', ''],
      },
    },
    {
      path: '/cases/:id',
      component: CasesDetail,
      meta: {
        pages: ['แฟ้มคดี | รายการคดี', 'ข้อมูลเคส / คดี'],
        routes: ['/cases', ''],
      },
    },
    {
      path: '/cases/:id/edit',
      component: CasesCreate,
      meta: {
        pages: ['แฟ้มคดี | รายการคดี', 'ข้อมูลเคส / คดี', 'แก้ไขข้อมูลคดี'],
        routes: ['/cases', '/cases/[id]', ''],
      },
    },
    {
      path: '/case-steps',
      component: CaseStepsPage,
      meta: {
        pages: ['จัดการขั้นตอนของคดี'],
        routes: [],
      },
    },
    {
      path: '/packages',
      component: PackagesPage,
      meta: {
        pages: ['แพ็กเกจและการชำระเงิน'],
        routes: [],
      },
    },
    {
      path: '/storage',
      component: StoragePage,
      meta: {
        pages: ['คลังจัดเก็บเอกสาร'],
        routes: [],
      },
    },
    {
      path: '/ocr',
      component: OcrPage,
      meta: {
        pages: ['ระบบค้นหาและอ่านเอกสาร OCR'],
        routes: [],
      },
    },
    {
      path: '/profile',
      children: [
        {
          path: ':id',
          component: profileDetail,
          meta: {
            pages: ['โพรไฟล์'],
            routes: [''],
          },
        },
      ],
    },
  ],
})

const PUBLIC_PATHS = ['/login', '/register', '/forget-password']

const PERMISSION_MAP: Record<string, string> = {
  '/calendar': 'is_sec_calendar',
  '/cases': 'is_sec_cases',
  '/case-steps': 'is_sec_cases',
  '/ocr': 'is_sec_ocr',
  '/storage': 'is_sec_documents',
  '/employee': 'is_sec_employee',
  '/overview': 'is_sec_report',
}

router.beforeEach((to) => {
  if (PUBLIC_PATHS.includes(to.path)) return true

  if (!localStorage.getItem('lawyer_hash')) {
    return { path: '/login', query: { isRedirected: '1' } }
  }

  const userStore = useUserStore()
  const perms = userStore.currentUser?.details?.permissions as Record<string, any> | undefined

  if (perms) {
    const requiredPerm = Object.keys(PERMISSION_MAP).find((prefix) =>
      to.path === prefix || to.path.startsWith(prefix + '/'),
    )
    if (requiredPerm) {
      const permKey = PERMISSION_MAP[requiredPerm]
      if (!Number(perms[permKey])) {
        return { path: '/', replace: true }
      }
    }
  }

  return true
})

export default router
