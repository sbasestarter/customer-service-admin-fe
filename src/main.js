import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {Button,Switch} from 'ant-design-vue'

createApp(App).use(Button).use(Switch).use(store).use(router).mount('#app')
