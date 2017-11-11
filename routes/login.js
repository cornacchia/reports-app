var express = require('express')
var passport = require('../bin/passport')
var router = express.Router()

/* Attempt login */
router.post('/',  passport.authenticate('local', { failureRedirect: '/' }),
function(req, res) {
  res.redirect('/admin/manage')
})

module.exports = router
