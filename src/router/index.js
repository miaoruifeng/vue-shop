import Vue from 'vue'
import Router from 'vue-router'

// import Login from '../components/Login'
// import Home from '../components/Home'
// import Welcome from '../components/Welcome'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome')

// import Users from '../components/user/Users'
// import Rights from '../components/power/Rights'
// import Roles from '../components/power/Roles'
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/user/Users')
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Rights')
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Roles')

// import Category from '../components/goods/Category'
// import Params from '../components/goods/Params'
const Category = () => import(/* webpackChunkName: "category_params" */ '../components/goods/Category')
const Params = () => import(/* webpackChunkName: "category_params" */ '../components/goods/Params')

// import List from '../components/goods/List'
// import Add from '../components/goods/Add'
const List = () => import(/* webpackChunkName: "list_add" */ '../components/goods/List')
const Add = () => import(/* webpackChunkName: "list_add" */ '../components/goods/Add')

// import Order from '../components/order/Order'
// import Report from '../components/report/Report'
const Order = () => import(/* webpackChunkName: "order_report" */ '../components/order/Order')
const Report = () => import(/* webpackChunkName: "order_report" */ '../components/report/Report')

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Category },
        { path: '/params', component: Params },
        { path: '/goods', component: List },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report }
      ]
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

// 解决重复点击路由报错问题
if (process.env.NODE_ENV === 'development') {
  const routerPush = Router.prototype.push
  Router.prototype.push = function push(location) {
    return routerPush.call(this, location).catch(error => error)
  }
}

export default router
