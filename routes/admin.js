const express = require('express')
const fs = require('fs')
const async = require('async')
const path = require('path')
const ObjectId = require('mongodb').ObjectID
const jsonCsv = require('json-csv')
const csvOptions = require('../bin/csvOptions')
const database = require('../bin/db')
const encrypt = require('../bin/encrypt')
const utils = require('../bin/utils')
const dateToString = require('../bin/dateToString')
const config = require('../config')
const router = express.Router()

/* Show user registration page */
router.get('/register', (req, res, next) => {
  res.render('register-user', { title: 'Registra nuovo utente' })
})

/* Show user list page */
router.get('/userList', (req, res, next) => {
  const db = database.get()

  db.collection('user').find({}).toArray((err, users) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }

    return res.render('user-list', { title: 'Lista utenti', users: users })
  })
})

/* Show admin management page */
router.get('/manage', (req, res, next) => {
  // TODO: factorize similar function in mobile controller
  const db = database.get()

  async.parallel({
    site: siteCb => {
      db.collection('siteOptions')
      .find({})
      .toArray((err, result) => {
        if (err) {
          console.error(err)
          return siteCb(err)
        }

        return siteCb(null, result)
      })
    },
    vehicle: vehicleCb => {
      db.collection('vehicleOptions')
      .find({})
      .toArray((err, result) => {
        if (err) {
          console.error(err)
          return vehicleCb(err)
        }

        return vehicleCb(null, result)
      })
    }
  }, (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send()
    }

    return res.render('manage', { title: 'Amministrazione database', elements: results })
  })
})

/* Get reports list */
router.get('/reportsList', (req, res, next) => {
  const db = database.get()

  db.collection('Reports').find({}).toArray((err, reports) => {
    const dates = ['date']
    const hours = ['workStarted', 'workPaused', 'workStopped']
    const elements = reports.map(function (el) {
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
router.post('/register', (req, res, next) => {
  const db = database.get()

  const cryptoPassword = encrypt(req.body.password)

  const newUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    type: req.body.type,
    username: req.body.username,
    password: cryptoPassword
  }

  db.collection('user').findOne({username: newUser.username}, (err, user) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }
    if (user) {
      console.error('Duplicate username registration error')
      return res.status(500).send('Error')
    }
    db.collection('user').insertOne(newUser, function (err) {
      if (err) {
        console.error(err)
        return res.status(500).send('Error')
      }

      return res.redirect('/admin/userList')
    })
  })
})

/* Delete existing user */
router.post('/deleteUser', (req, res, next) => {
  const db = database.get()

  db.collection('user').deleteOne({username: req.body.username}, err => {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }

    return res.redirect('/admin/userList')
  })
})

/* Add Misc collection object */
router.post('/addMiscObject', (req, res, next) => {
  const db = database.get()
  let collection = ''
  let newObject = {}

  if (req.body.category === 'vehicle') {
    newObject = {
      plaque: req.body.plaque,
      description: req.body.description
    }
    collection = 'vehicleOptions'

  } else if (req.body.category === 'site') {
    newObject = {
      code: req.body.code,
      name: req.body.name
    }
    collection = 'siteOptions'
  }

  db.collection(collection).insertOne(newObject, function (err) {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }

    res.redirect('/admin/manage')
  })
})

/* Remove Misc collection object */
router.post('/removeMiscObject', (req, res, next) => {
  const db = database.get()
  const category = req.body.category
  let collection = ''

  if (category === 'vehicle') {
    collection = 'vehicleOptions'
  } else if (category === 'site') {
    collection = 'siteOptions'
  }

  db.collection(collection).deleteOne({_id: new ObjectId(req.body.id)}, function (err) {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }

    res.redirect('/admin/manage')
  })
})

/* Get sites page */
router.get('/sites', (req, res, next) => {
  const db = database.get()

  db.collection('siteOptions')
  .find({})
  .toArray((err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send()
    }

    res.render('sites', { title: 'Siti', sites: results })
  })
})

/* Get specific site page */
router.get('/site', (req, res, next) => {
  const db = database.get()
  const code = req.query.code
  console.log('CODE-----', req.query.code)

  async.parallel({
    site: siteCb => {
      db.collection('siteOptions')
      .findOne({code: code}, (err, site) => {
        if (err) {
          console.error(err)
          return siteCb(err)
        }

        return siteCb(null, site)
      })
    },
    report: reportCb => {
      db.collection('report')
      .find({site: code})
      .toArray((err, result) => {
        if (err) {
          console.error(err)
          return reportCb(err)
        }

        return reportCb(null, result)
      })
    },
    vehicle: vehicleCb => {
      db.collection('vehicle')
      .find({site: code})
      .toArray((err, result) => {
        if (err) {
          console.error(err)
          return vehicleCb(err)
        }

        return vehicleCb(null, result)
      })
    },
    picture: pictureCb => {
      db.collection('picture')
      .find({site: code})
      .toArray((err, result) => {
        if (err) {
          console.error(err)
          return pictureCb(err)
        }

        return pictureCb(null, result)
      })
    },
    audio: audioCb => {
      db.collection('audio')
      .find({site: code})
      .toArray((err, result) => {
        if (err) {
          console.error(err)
          return audioCb(err)
        }

        return audioCb(null, result)
      })
    }
  }, (err, result) => {
    if (err) {
      console.error(err)
      return res.status(500).send()
    }

    let data = {
      site: result.site,
      report: result.report,
      vehicle: result.vehicle,
      picture: {},
      audio: {}
    }

    for (let pic of result.picture) {
      const date = dateToString(pic.date)
      if (data.picture[date]) {
        data.picture[date].data.push(pic)
      } else {
        data.picture[date] = {
          date: date,
          data: [pic]
        }
      }
    }

    for (let aud of result.audio) {
      const date = dateToString(aud.date)
      if (data.audio[date]) {
        data.audio[date].data.push(aud)
      } else {
        data.audio[date] = {
          date: date,
          data: [aud]
        }
      }
    }

    return res.render('site', { title: result.site.name, element: data})
  })
})

/* Export reports csv */
router.get('/exportCsv', (req, res, next) => {
  const db = database.get()

  db.collection('Reports').find({})
  .toArray(function (err, reports) {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }

    const options = csvOptions

    jsonCsv.csvBuffered(reports, options, (err, csv) => {
      if (err) {
        console.error(err)
        return res.status(500).send('Error')
      }

      var csvName = Date.now() + '.csv'

      fs.writeFile(path.join(config.csvFolderPath, csvName), csv, err => {
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
