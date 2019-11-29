import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import './plugins/element'
import treeTable from 'vue-table-with-tree-grid'

import './assets/fonts/iconfont.css'
import './assets/css/global.css'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.component('tree-table', treeTable)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
