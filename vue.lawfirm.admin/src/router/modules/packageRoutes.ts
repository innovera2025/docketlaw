import packagePage from '@/views/package/package-page.vue'
import packageAdd from '@/views/package/package-add.vue'
import packageDetail from '@/views/package/package-detail.vue'

const packageRoutes = [
  {
    name: 'package',
    path: '/package',
    component: packagePage,
    meta: {
      pages: ['จัดการแพ็กเกจ'],
      routes: [],
    },
  },
  {
    name: 'package-add',
    path: '/package/add',
    component: packageAdd,
    meta: {
      pages: ['จัดการแพ็กเกจ', 'สร้างแพ็กเกจใหม่'],
      routes: ['/package'],
    },
  },
  {
    name: 'package-detail',
    path: '/package/:id',
    component: packageDetail,
    meta: {
      pages: ['จัดการแพ็กเกจ', 'รายละเอียดแพ็กเกจ'],
      routes: ['/package'],
    },
  },
  {
    name: 'package-edit',
    path: '/package/:id/edit',
    component: packageDetail,
    meta: {
      pages: ['จัดการแพ็กเกจ', 'รายละเอียดแพ็กเกจ', 'แก้ไขรายละเอียดแพ็กเกจ'],
      routes: ['/package', '/package/:id'],
    },
  },
]

export default packageRoutes
