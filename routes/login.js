const express = require('express')
const passport = require('../bin/passport')
const router = express.Router()

/* Attempt login */
router.post('/',  passport.authenticate('local', { failureRedirect: '/' }),
(req, res) => {
  res.redirect('/admin/manage')
})

module.exports = router
