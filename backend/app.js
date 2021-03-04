
var express = require('express'), 
    http = require('http'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    unless = require('express-unless'),
    authenticateToken = require('./auth').authenticateToken,
    cookieParser = require('cookie-parser'),
    port = require('./config').port;


require('./mongo'),
require('./models/User')
require('./models/RefreshToken')

const app = express()
app.use(cookieParser());
// register token middleware
// provide middleware with unless capabilities
authenticateToken.unless = unless;
app.use(authenticateToken.unless({ path: ['/login', '/token', '/signup', '/logout']}));

//app.use(authenticateToken);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// using sessions for serverside user state
app.use(session({ secret: 'candycandoit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));
// registering api endpoints
app.use(require('./api'));
app.listen(port, () => {
  console.log(`JAWAT listening at http://localhost:${port}`)
})