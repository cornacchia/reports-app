var express = require('express')
var database = require('../bin/db')
var encrypt = require('../bin/encrypt')
var router = express.Router()

/* Show user registration page */
router.get('/register', function(req, res, next) {
  res.render('register-user', { title: 'Registra nuovo utente' })
})

/* Show user list page */
router.get('/userList', function(req, res, next) {
  var db = database.get()

  db.collection('User').find({}).toArray(function (err, users) {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }

    return res.render('userList', { title: 'Lista utenti', users: users })
  })
})

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

  db.collection('User').findOne({username: newUser.username}, function (err, user) {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }
    if (user) {
      console.error('Duplicate username registration error')
      return res.status(500).send('Error')
    }
    db.collection('User').insertOne(newUser, function (err) {
      if (err) {
        console.error(err)
        return res.status(500).send('Error')
      }
  
      return res.redirect('/admin/userList')
    })
  })
})

/* Delete existing user */
router.post('/deleteUser', function (req, res, next) {
  var db = database.get()

  db.collection('User').deleteOne({username: req.body.username}, function (err) {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }

    return res.redirect('/admin/userList')
  })
})

module.exports = router
