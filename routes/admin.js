var express = require('express')
var router = express.Router()

/* Show user registration page */
router.get('/register', require('connect-ensure-login').ensureLoggedIn('/'), function(req, res, next) {
  res.render('register-user', { title: 'Registra nuovo utente' })
})

module.exports = router
