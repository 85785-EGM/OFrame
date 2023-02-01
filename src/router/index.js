import { createRouter, createWebHashHistory } from 'vue-router'
import guide from './guide'
import common from './common'

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [...guide, ...common]
})
