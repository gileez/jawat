import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import router from './services/router';
import store from './services/store';

Vue.config.productionTip = false

// setup bootstrap
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

Vue.use(VueRouter);
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});