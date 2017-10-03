var express = require('express')
var router = express.Router()

/* Show user registration page */
router.get('/register', function(req, res, next) {
  res.render('register-user', { title: 'Registra nuovo utente' })
})

module.exports = router
