<template>
  <div class="container">
    <router-view></router-view>
  </div>
</template>

<script>
var axe = require('./services/axe');
export default {
  name: "App",
  components: {},
  created: function () {
    axe.refreshToken();
  },
  data() {
    return {};
  },
};
</script>
<style>
button { 
  margin: 5px;}
</style>