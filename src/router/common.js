import NotFound from '@/views/NotFound.vue'

export default [
  { name: 'common-home', path: '/', redirect: '/home' },
  {
    name: 'common-notfound',
    path: '/:pathMatch(.*)*',
    component: NotFound
  }
]
