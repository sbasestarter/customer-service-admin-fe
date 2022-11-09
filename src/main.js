import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {Button,Switch,Collapse, List, Avatar, Row, Col, Badge, Image, Comment, Input, Form, Upload } from 'ant-design-vue'
import * as antIcons from "@ant-design/icons-vue"
import * as api from '@/api/api'
import axios from '@/api/axios.js'

const app = createApp(App)
app.use(Button).use(Switch).use(Collapse).use(List).use(Avatar).use(Image).use(Comment).use(Input).use(Form).use(Upload)
  .use(Row).use(Col)
  .use(Badge).use(store).use(router).mount('#app')

Object.keys(antIcons).forEach(key => {
  app.component(key, antIcons[key])
})

app.config.globalProperties.$antIcons = antIcons
app.config.globalProperties.$api = api
app.config.globalProperties.$axios = axios
