const express = require('express')
const passport = require('../bin/passport')
const router = express.Router()

/* Attempt login */
router.get('/', (req, res) => {
  req.session.destroy()
  req.logout()
  res.redirect('/')
})

module.exports = router