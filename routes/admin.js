var express = require('express')
var fs = require('fs')
const path = require('path')
var ObjectId = require('mongodb').ObjectID
var jsonCsv = require('json-csv')
var csvOptions = require('../bin/csvOptions')
var database = require('../bin/db')
var encrypt = require('../bin/encrypt')
var utils = require('../bin/utils')
var config = require('../config')
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

/* Show admin management page */
router.get('/manage', function (req, res, next) {
  var db = database.get()

  db.collection('Misc').find({}).toArray(function (err, result) {
    var elements = {
      'vehicle': [],
      'site': []
    }
    for (var i in result) {
      elements[result[i].category].push(result[i])
    }
    return res.render('manage', { title: 'Amministrazione database', elements: elements })
  })
})

/* Get reports list */
router.get('/reportsList', function (req, res, next) {
  var db = database.get()

  db.collection('Reports').find({}).toArray(function (err, reports) {
    var dates = ['date']
    var hours = ['workStarted', 'workPaused', 'workStopped']
    var elements = reports.map(function (el) {
      el.date = utils.formatDate(el.date)
      el.workStarted = utils.formatHours(el.workStarted)
      el.workPaused = utils.formatHours(el.workPaused)
      el.workStopped = utils.formatHours(el.workStopped)

      return el
    })

    return res.render('reportsList', { title: 'Lista rapportini', elements: elements})
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

/* Add Misc collection object */
router.post('/addMiscObject', function (req, res, next) {
  var db = database.get()

  var newObject = {}
  if (req.body.category === 'vehicle') {
    newObject = {
      plaque: req.body.plaque,
      description: req.body.description,
      category: 'vehicle'
    }
  } else if (req.body.category === 'site') {
    newObject = {
      code: req.body.code,
      name: req.body.name,
      category: 'site'
    }
  }
  db.collection('Misc').insertOne(newObject, function (err) {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }

    res.redirect('/admin/manage')
  })
})

/* Remove Misc collection object */
router.post('/removeMiscObject', function (req, res, next) {
  var db = database.get()
  db.collection('Misc').deleteOne({_id: new ObjectId(req.body.id)}, function (err) {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }

    res.redirect('/admin/manage')
  })
})

/* Export reports csv */
router.get('/exportCsv', function (req, res, next) {
  var db = database.get()
  db.collection('Reports').find({})
  .toArray(function (err, reports) {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }

    var options = csvOptions

    jsonCsv.csvBuffered(reports, options, function (err, csv) {
      if (err) {
        console.error(err)
        return res.status(500).send('Error')
      }

      var csvName = Date.now() + '.csv'

      fs.writeFile(path.join(config.csvFolderPath, csvName), csv, function (err) {
        if (err) {
          console.error(err)
          return res.status(500).send('Error')
        }

        return res.redirect('/admin/reportsList')
      })
    })
  })
})

module.exports = router
