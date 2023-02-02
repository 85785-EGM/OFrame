import App from '@/App.vue'
import store from '@/stores'
import router from '@/router'
import toolkits from '@/toolkits'
import { createApp } from 'vue'

createApp(App).use(router).use(store).use(toolkits).mount('#app')
