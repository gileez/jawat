<template>
  <div class="container" style="padding-top: 100px; width: 400px">
    <b-card no block>
      <b-form class="mt-3"> 
        <label class="form-label">E-mail</label>
        <input class="form-control" v-model="email" placeholder="E-mail" />
        <label class="form-label">Password</label>
        <input
          class="form-control"
          v-model="password"
          type="password"
          placeholder="password"
        />
        <div class="row justify-content-center" style="padding-top:30px">
          <div class="col-16">
            <button class="btn btn-primary" @click="login('/signup')">
              Signup
            </button>

            <button class="btn btn-primary" @click="login('/login')">
              Login
            </button>
          </div>
        </div>
      </b-form>
    </b-card>
  </div>
</template>

<script>
const axe = require("../services/axe");
export default {
  name: "Login",
  components: {},
  data() {
    return {
      email: "",
      password: "",
    };
  },
  created: function () {},
  methods: {
    login(endpoint) {
      var user = { email: this.$data.email, password: this.$data.password };
      axe[endpoint.slice(1)](user);
    },
  },
};
</script>