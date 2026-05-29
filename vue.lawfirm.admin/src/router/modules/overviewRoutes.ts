import overviewPage from '@/views/overview/overview-page.vue'

const overviewRoutes = [
  {
    name: 'overview',
    path: '/overview',
    component: overviewPage,
    meta: {
      pages: ['ภาพรวมและรายงาน'],
      routes: [],
    },
  },
]

export default overviewRoutes
