import Test from '@/views/web3d/Test.vue'
import Router from '@/views/Router.vue'

export default [
  {
    name: 'web3d',
    path: '/web3d',
    component: Router,
    children: [
      {
        name: 'web3d-test',
        path: 'test',
        component: Test
      }
    ]
  }
]
