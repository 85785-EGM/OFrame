import Octree from '@/views/web3d/Octree.vue'
import Router from '@/views/Router.vue'

export default [
  {
    name: 'web3d',
    path: '/web3d',
    component: Router,
    children: [
      {
        name: 'web3d-octree',
        path: 'octree',
        component: Octree
      }
    ]
  }
]
