<template>
  <div class="mt-3">
    <b-card no block>
    THIS IS YOUR HOME...<br />
    <div class="row">
    <button class="btn btn-primary" @click="secretData()">Protected</button>
    <button class="btn btn-primary" @click="logout()">Logout</button>
    <button class="btn btn-primary" @click="refreshToken()">Refresh Token</button>
    </div>
    </b-card>
  </div>
</template>

<script>
const axe = require("../services/axe");
export default {
  name: "Home",
  components: {},
  data() {
    return {};
  },
  methods: {
    secretData() {
      axe.secretData();
    },
    logout() {
      axe.logout();
    },
    refreshToken() {
      axe.refreshToken();
    },
  },
};
</script>
<style>
</style>