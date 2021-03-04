import Login from '../components/Login';
import Home from '../components/Home';
import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './store';

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: "/home",
    component: Home,
  },
  {
    path: "/login",
    component: Login,
  }
];

Vue.use(VueRouter);
var router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    // force scroll to page top whenever route changes
    return { x: 0, y: 0 }
  }
});

// router shouldn't let you see anything unless you're logged in
router.beforeEach((to, from, next) => {
  if (to.path != "/login" && !store.getters['loggedin']) {
    // not logged in and trying to go somewhere else. NAUGHTY
    next("/login");
  } else {
    next();
  }
})

export default router;