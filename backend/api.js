var router = require('express').Router();
var mongoose = require('mongoose');
const auth = require('./auth');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');
var RefreshToken = mongoose.model('RefreshToken');
const { v4: uuid } = require('uuid');
var REFRESH_EXP = require('./config').REFRESH_EXP
var ACCESS_EXP = require('./config').ACCESS_EXP


router.get('/logout', function (req, res, next) {
    var { id: user_id } = jwt.decode(req.cookies.ACCESS_TOKEN);
    console.log("got token ", user_id);
    if (user_id) RefreshToken.removeByUserID(user_id);
    return res.send("Logged out");
});

function validateLoginData(req, res) {
    if (!req.body.email) return res.status(422).json({ errors: { email: "can't be blank" } });
    if (!req.body.password) return res.status(422).json({ errors: { password: "can't be blank" } });
    return
}

router.post('/signup', function (req, res, next) {
    var ret = validateLoginData(req, res);
    if (ret) return res.status(422).json(ret);
    // generate new user
    var user = new User({ email: req.body.email });
    user.setPassword(req.body.password);
    user.save()
        .then((user) => {
            login_helper(req, user, res)
        })
        .catch((err) => {
            return res.status(422).json({ errors: { password: "DB failure!" } });
        });
});

/* Once a user has been authenticated (either via hash or token) we move on to
generating a token and adding the necessary session data that will be stored server side */
function handle_refresh_token(user) {
    var uid = uuid();
    var exp = new Date();
    exp.setMinutes(exp.getMinutes() + REFRESH_EXP);
    // invalidate previous token if exists
    // store to db
    RefreshToken.create({ uid: uid, exp: exp, user_id: user._id }, (err, token_doc) => {
        if (err) {
            console.error(err);
        }
    });
    return uid;
}
function login_helper(req, user, res) {
    var access = user.generateJWT();
    var refresh = handle_refresh_token(user);
    if (access && refresh) {
        store_cookies(access, refresh, res)
        // give this man his tokens
        return res.json({ user: { access: access, refresh: refresh, email: user.email } });
    } else {
        // something wrong with generating the tokens
        return res.status(500).json({ errors: { password: "Failed to generate tokens" } });
    }
}
function store_cookies(access, refresh, res) {
    // todo - add secure also
    if (access) {
        res.cookie('ACCESS_TOKEN', access, { maxAge: ACCESS_EXP * 60 * 1000, httpOnly: true });
    }
    if (refresh) {
        res.cookie('REFRESH_TOKEN', refresh, { maxAge: REFRESH_EXP * 60 * 1000, httpOnly: true, path: '/token' });
    }
}
router.post('/login', (req, res) => {
    // validate inputs
    var ret = validateLoginData(req, res);
    if (ret) return ret;
    // make sure we have this user
    User.findOne({ email: req.body.email }).exec((err, user) => {
        if (err) {
            console.error(err);
            return res.status(500);
        }
        if (!user) {
            return res.status(404).json({ errors: { email: "No such email!" } });
        }
        if (user.validPassword(req.body.password)) {
            return login_helper(req, user, res);
        } else {
            // take your sticks. you're not doing lag baomer itanu
            return res.status(404).json({ errors: { password: "Invalid password!" } });
        }
    });
})

router.get('/protected', (req, res) => {
    console.log("protected");
    res.send("you got the protected content");
})

router.get('/token', (req, res) => {
    // look for the refresh cookie
    var refresh_token = req.cookies.REFRESH_TOKEN
    if (!refresh_token) {
        return res.status(404).json({ errors: "No token found" });
    }
    // make sure we got this token
    return RefreshToken.findOne({ uid: refresh_token }).then(refresh => {
        console.log(refresh)
        if (!refresh) {
            throw 'No such token'
        }
        if (refresh.validate()) {
            // generate a new JWT
            console.log("looking for user: ", refresh.user_id)
            return User.findById(refresh.user_id).exec().then(user => {
                // TODO: GAL - why is this step necessary?
                var user_obj = User(user);
                var access = user_obj.generateJWT();
                if (access) {
                    store_cookies(access, null, res);
                    return res.json({ user: { access: access } });
                } else {
                    return res.status(500).json({ errors: "Unable to generate JWT for this user" });
                }
            }).catch(e => {
                console.log(e);
                return res.status(500).json({ errors: "Exception while looking for the user" });
            })

        } else {
            // token is no longer valid
            // remove tokens from db
            RefreshToken.removeByUserID(refresh.user_id)
            return res.status(404).json({ errors: "Refresh token expired. please login" });
        }
    }).catch(e => {
        console.error(e);
        return res.status(404).json({ errors: "No such refresh token on server" });
    })
});

module.exports = router;
