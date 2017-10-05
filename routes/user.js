var express = require('express')
var database = require('../bin/db')
var encrypt = require('../bin/encrypt')
var config = require('../config')
var router = express.Router()

/* Register new user */
router.post('/register', function(req, res, next) {
  var db = database.get()

  var cryptoPassword = encrypt(req.body.password)

  var newUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    type: req.body.type,
    username: req.body.username,
    password: cryptoPassword
  }

  db.collection('User').insertOne(newUser, function (err) {
    if (err) {
      console.error(err)
      return res.serverError()
    }

    return res.status(200).send()
  })


})

module.exports = router
