const jwt = require('jsonwebtoken')
const config = require('../config')

function mobileLoggedIn (req, res, next) {
  const token = req.body.token.data
  console.log('received token', token)

  if (token) {
    jwt.verify(token, config.mobile.secret, (err, user) => {
      if (err) {
        console.error(err)
        return res.status(403).send()
      }

      console.log('ok')

      return next()
    })
  } else {
    return res.status(403).send()
  }
}

module.exports = mobileLoggedIn
