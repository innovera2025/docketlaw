import employeePage from '@/views/employee/employee-page.vue'
import employeeDetail from '@/views/employee/employee-detail.vue'

const employeeRoutes = [
  {
    name: 'employee',
    path: '/employee',
    component: employeePage,
    meta: {
      pages: ['ข้อมูลพนักงาน, ทนาย'],
      routes: [],
    },
  },
  {
    name: 'employee-detail',
    path: '/employee/:id',
    component: employeeDetail,
    meta: {
      pages: ['ข้อมูลพนักงาน, ทนาย', 'รายละเอียดพนักงาน'],
      routes: ['/employee', ''],
    },
  },
]

export default employeeRoutes

