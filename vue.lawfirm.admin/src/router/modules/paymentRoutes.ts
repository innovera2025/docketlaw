import paymentPage from '@/views/payment/payment-page.vue'

const paymentRoutes = [
  {
    name: 'payment',
    path: '/payment',
    component: paymentPage,
    meta: {
      pages: ['ตรวจเช็คการชำระเงิน'],
      routes: [],
    },
  },
]

export default paymentRoutes
