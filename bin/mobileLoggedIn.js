/** Middleware to check if a mobile user is logged in */

const jwt = require('jsonwebtoken')
const config = require('../config')

function mobileLoggedIn (req, res, next) {
  const token = req.headers.token

  if (token) {
    jwt.verify(token, config.mobile.secret, (err, user) => {
      if (err) {
        console.error(err)
        return res.status(403).send()
      }

      return next()
    })
  } else {
    return res.status(403).send()
  }
}

module.exports = mobileLoggedIn
