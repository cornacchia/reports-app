var express = require('express')
var router = express.Router()

/* Attempt login */
router.post('/', function(req, res, next) {
  var username = req.body.username
  var password = req.body.password
})

module.exports = router
