import jwt from 'jsonwebtoken'
import axios from 'axios';
import router from './router';
import store from './store';

const PUBLIC_PATHS = ["/login", "/token", "/signup", "/logout"];

function non200(response) {
    return Promise.reject(`Non 200 response from: ${response.config.url}`)
}

function logout_helper() {
    store.dispatch('logout');
    if (router.currentRoute.path != '/login') router.push('/login');
    console.log("Logged out");
}

/* Error interceptor for 401, 403 responses: attempts to refresh token and returns original request */
axios.interceptors.response.use(null, (error) => {
    if ([401, 403].includes(error.response.status) && !error.config._retry) {
        error.config._retry = true;
        console.log("Attempting to refresh access token");
        return refreshToken().then(() => { return axios(error.config) });
    }
    // Not a 401 or 403 - carry on
    return Promise.reject(error);
});

/* Request interceptor: checks for access token exp and attempts to refresh before making original request */
function local_expiry_check(config) {
    // make sure this end point needs protection
    if (PUBLIC_PATHS.includes(config.url)) {
        // this request is public
        console.log(`Allowing request to ${config.url} as it is public`);
        return config;
    }
    // grab token from storage
    var token = localStorage.getItem("access");
    if (!token) {
        // there is no tokens
        logout_helper()
        return Promise.reject("No token found. You'll have to login");
    }
    // OPTIMIZATION: following block makes sure jwt hasnt expired before trying to grab resource
    const { exp } = jwt.decode(token);
    if (Date.now() - exp * 1000 > 0) {
        // jwt is expired. we need a new one
        console.error("Access token expired");
        return refreshToken().then(() => { return config });
    }
    return config;
}
// currently not running this as not holding local copy of jwt
//axios.interceptors.request.use(local_expiry_check)

export function signup(user) {
    return axios
        .post('/signup', user)
        .then((response) => {
            if (response.status == 200) {
                store.dispatch('login');
            } else {
                return non200(response);
            }
        })
        .catch((e) => {
            console.error(`Exception while attempting to log in:\n${e}`);
        });
}

export function login(user) {
    return axios
        .post('/login', user)
        .then((response) => {
            if (response.status == 200) {
                store.dispatch('login', response.data.user.access);
            } else {
                return non200(response);
            }
        })
        .catch((e) => {
            console.error(`Exception while attempting to log in:\n${e}`);
        });
}

export function secretData() {
    return axios
        .get("/protected")
        .then((response) => {
            if (response.status == 200) {
                console.log(`Protected endpoint says: ${response.data}`);
            } else {
                return non200(response);
            }
        })
        .catch((e) => {
            console.error(`Exception while attempting to get protected data:\n${e}`);
        });
}

export function logout() {
    return axios
        .get("/logout")
        .then((response) => {
            if (response.status !== 200) {
                return non200(response);
            }
        })
        .catch((e) => {
            console.error(`Exception while attempting to logout:\n${e}`);
        }).finally(() => {
            logout_helper()
        });
}

export function refreshToken() {
    return axios
        .get("/token")
        .then((response) => {
            if (response.status == 200) {
                store.dispatch('setJWT', { jwt: response.data.user.access });
            } else {
                return non200(response);
            }
        })
        .catch((e) => {
            console.error(
                `Exception while trying to grab new token with error:\n${e}`
            );
            logout_helper()
        });
}