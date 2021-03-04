import Vuex from 'vuex';
import Vue from 'vue';
import router from './router';
import jwt from 'jsonwebtoken'
Vue.use(Vuex)
const state = {
  loggedin: false,
  JWT: null
} 
const mutations = {
  login (state) {
    state.loggedin = true;
    if (router.currentRoute.path != '/home') router.push('/home');
  },
  logout (state) {
    state.loggedin = false;
    state.JWT = null

  },
  setJWT (state, payload) {
    state.JWT = jwt.decode(payload.jwt);
  }
}
const actions = {
  login: ( context, payload ) => {
    context.commit('login');
    context.commit('setJWT', payload)
    },
  logout: ({ commit }) => {commit('logout')},
  setJWT: (context, payload) => { context.commit('setJWT', payload)}
}
const getters = {
  loggedin: state => state.loggedin
}
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})