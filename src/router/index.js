import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      children: [{
        path: '/home',
        component: Welcome
      }]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // next 是一个函数，表示放行。有两种方式：1.next()--放行； 2.next('/login')--强制跳转
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
