var express = require('express')
var passport = require('passport')
var router = express.Router()

/* Attempt login */
router.post('/',  passport.authenticate('local', { failureRedirect: '/' }),
function(req, res) {
  res.redirect('/admin/register')
})

module.exports = router
