var express = require('express')
var router = express.Router()

/* Register new user */
router.post('/register', function(req, res, next) {
  var firstName = req.body.firstName
  var lastName = req.body.lastName
  var type = req.body.type
  var username = req.body.username
  var password = req.body.password

})

module.exports = router
