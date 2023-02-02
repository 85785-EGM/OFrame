import { createRouter, createWebHashHistory } from 'vue-router'
import guide from './guide'
import common from './common'
import web3d from './web3d'

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [...guide, ...common, ...web3d]
})
