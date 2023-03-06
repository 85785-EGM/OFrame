import App from '@/App.vue'
import store from '@/stores'
import router from '@/router'
import toolkits from '@/toolkits'
import { createApp } from 'vue'

import { computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'
import { BufferGeometry } from 'three'

BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
BufferGeometry.prototype.boundsTree = null

createApp(App).use(router).use(store).use(toolkits).mount('#app')
