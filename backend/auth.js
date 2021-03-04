var jwt = require('jsonwebtoken')
var secret = require('./config').secret;

function authenticateToken(req, res, next) {
  console.log("Running authentication on token for path ", req.path);
  // Attempt to extract access token from cookie
  var token = req.cookies.ACCESS_TOKEN;
  if (!token) {
    // maybe from the request header...
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  }

  if (!token) return res.sendStatus(401)

  jwt.verify(token, secret, (err, token) => {
    if (err) {
      console.error(err);
      return res.sendStatus(403)
    }
    // good to go
    next()
  })
}

module.exports = {
  authenticateToken: authenticateToken
};