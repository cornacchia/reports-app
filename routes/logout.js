var express = require('express')
var passport = require('../bin/passport')
var router = express.Router()

/* Attempt login */
router.get('/', function(req, res) {
  req.session.destroy()
  req.logout()
  res.redirect('/')
})

module.exports = router