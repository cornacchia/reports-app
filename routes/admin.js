const express = require('express')
const fs = require('fs')
const async = require('async')
const path = require('path')
const moment = require('moment')
const ObjectId = require('mongodb').ObjectID
const hourToString = require('../bin/hourToString')
const ensureDirExistence = require('../bin/ensureDirExistence')
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

function getUserReportData (username, from, to, cb) {
  const db = database.get()
  let reportQuery = {username: username}
  let vehicleQuery = {username: username}

  if (from && !to) {
    reportQuery['ts'] = {$gte: from}
    vehicleQuery['ts'] = {$gte: from}
  } else if (!from && to) {
    reportQuery['ts'] = {$lte: to}
    vehicleQuery['ts'] = {$lte: to}
  } else if (from && to) {
    reportQuery['$and'] = [{'ts': {$gte: from}}, {'ts': {$lte: to}}]
    vehicleQuery['$and'] = [{'ts': {$gte: from}}, {'ts': {$lte: to}}]
  }

  async.parallel({
    reports: rCb => {
      db.collection('report').find(reportQuery)
      .sort({ts: 1})
      .toArray((err, result) => {
        if (err) {
          console.error('Error retrieving reports for user', req.body.username, err)
          return rCb(err)
        }

        return rCb(null, result)
      })
    },
    vehicles: vCb => {
      db.collection('vehicle').find(vehicleQuery)
      .sort({ts: 1})
      .toArray((err, result) => {
        if (err) {
          console.error('Error retrieving vehicle informations for user', req.body.username, err)
          return vCb(err)
        }

        return vCb(null, result)
      })
    }
  }, (err, data) => {
    if (err) {
      return cb(err)
    }

    let result = {}
    for (let report of data.reports) {
      let month = moment(report.ts).format('MMMM YYYY')
      let reportWorkTime = ((report.workStopped - report.workStarted) / 36e5) - report.workPause
      let reportWorkTravelTime = reportWorkTime - (report.travelTime / config.calculations.workTravelTimeDenominator)
      report.totalWorkTime = reportWorkTime
      report.totalWorkTravelTime = reportWorkTravelTime
      if (result[month]) {
        result[month]['reports'][report.date] = report
        result[month].totalWorkTime += reportWorkTime
        result[month].totalWorkTravelTime += reportWorkTravelTime
        result[month].totalTravelTime += report.travelTime
        result[month].daysWorked += 1
      } else {
        result[month] = {reports: {}}
        result[month]['reports'][report.date] = report
        result[month].totalWorkTime = reportWorkTime
        result[month].totalTravelTime = report.travelTime
        result[month].totalWorkTravelTime = reportWorkTravelTime
        result[month].monthYear = month
        result[month].daysWorked = 1
      }
    }

    for (let month in result) {
      result[month].hoursWorked = result[month].daysWorked * 8
      result[month].tr = result[month].totalWorkTravelTime - (result[month].daysWorked * 8)
      result[month].trCalc = (Math.round((result[month].tr * 10) / config.calculations.tr) * config.calculations.tr) / 10
    }

    for (let vehicle of data.vehicles) {
      let month = moment(vehicle.ts).format('MMMM YYYY')
      if(result[month]) {
        if (result[month]['reports'][vehicle.date]) {
          if (result[month]['reports'][vehicle.date].vehicles) {
            result[month]['reports'][vehicle.date].vehicles.push(vehicle)
          } else {
            result[month]['reports'][vehicle.date].vehicles = [vehicle]
          }
        } else {
          result[month]['reports'][vehicle.date] = {vehicles: [vehicle]}
        }
      } else {
        result[month] = {reports: {}}
        result[month]['reports'][vehicle.date] = {vehicles: [vehicle]}
        result[month].monthYear = month
      }
    }

    return cb(null, result)
  })
}

/* See user reports */
router.post('/getUserReports', (req, res, next) => {
  let from = false
  let to = false
  if (req.body.from) from = moment(req.body.from, 'MM-DD-YYYY').toDate()
  if (req.body.to) to = moment(req.body.to, 'MM-DD-YYYY').toDate()

  getUserReportData(req.body.username, from, to, (err, result) => {
    if (err) {
      return res.status(500).send('Error querying for user reports')
    }

    res.render('user-reports', {
      title: 'Elenco rapporti',
      data: {
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        result: result
      }
    })
  })
})

function squadToString (squad) {
  let result = ''
  for (let i in squad) {
    result += squad[i]
    if (i < squad.length - 1) {
      result += ', '
    }
  }

  return result
}

function vehiclesToString (vehicles) {
  let result = ''
  for (let i in vehicles) {
    result += vehicles[i].vehicle
    if (i < vehicles.length - 1) {
      result += ', '
    }
  }
  return result
}

function generateCsv (csvPath, firstName, lastName, data) {
  const filePath = csvPath

  fs.appendFileSync(filePath, firstName + ' ' + lastName + '\n', 'utf8')
  for (let month in data) {
    let monthData = data[month]
    fs.appendFileSync(filePath, month + '\n', 'utf8')
    fs.appendFileSync(filePath, 'Data; Attività; Squadra; Mezzi; Inizio; Pausa; Fine; Viag.\n', 'utf8')
    for (let r in monthData.reports) {
      let report = monthData.reports[r]
      let newLine = report.date + ';' +
        report.site + ': ' + report.notes + ';' +
        squadToString(report.squad) + ';' +
        vehiclesToString(report.vehicles) + ';' +
        hourToString(report.workStarted) + '; ' +
        report.workPause + '; ' +
        hourToString(report.workStopped) + '; ' +
        report.travelTime + '; ' +
        report.totalWorkTime + '; ' +
        report.totalWorkTravelTime

      fs.appendFileSync(filePath, newLine + '\n', 'utf8')
    }
    let totalNewLine = ';;;;;;;' +
    monthData.totalTravelTime + ';' +
    monthData.totalWorkTime + '; ' +
    monthData.totalWorkTravelTime
    fs.appendFileSync(filePath, totalNewLine + '\n', 'utf8')
    fs.appendFileSync(filePath, '\n', 'utf8')
    let hoursWorkedNewline = ';;;;;;;;Totale ore;' +
    monthData.hoursWorked
    fs.appendFileSync(filePath, hoursWorkedNewline + '\n', 'utf8')
    let trNewline = ';;;;;;;;;' + monthData.trCalc
    fs.appendFileSync(filePath, trNewline + '\n', 'utf8')
    fs.appendFileSync(filePath, '\n', 'utf8')
  }
}

/* Get user CSV */
router.post('/getUserCsv', (req, res, next) => {
  let from = false
  let to = false
  if (req.body.from) from = moment(req.body.from, 'MM-DD-YYYY').toDate()
  if (req.body.to) to = moment(req.body.to, 'MM-DD-YYYY').toDate()

  ensureDirExistence(config.csvFolderPath)

  getUserReportData(req.body.username, from, to, (err, result) => {
    if (err) {
      return res.status(500).send('Error querying for user reports')
    }

    const csvName = Date.now() + '.csv'
    const csvPath = path.join(config.csvFolderPath, csvName)

    generateCsv(csvPath, req.body.firstName, req.body.lastName, result)

    res.sendFile(csvPath)
  })
})

function getAllReports (from, to, done) {
  const db = database.get()
  db.collection('user').find({})
  .toArray((err, users) => {
    if (err) {
      console.error('Error retrieving all users', err)
      return res.status(500).send()
    }

    const dbOps = {}

    for (let user of users) {
      dbOps[user.firstName + ' ' + user.lastName] = cb => {
        getUserReportData(user.username, from, to, (err, result) => {
          if (err) {
            return cb(err)
          }
          result.firstName = user.firstName
          result.lastName = user.lastName
          return cb(null, result)
        })
      }
    }

    async.series(dbOps, (err, result) => {
      if (err) {
        console.error(err)
        return done(err)
      }

      return done(null, result)
    })
  })
}

/* Global reports page */
router.get('/reports', (req, res) => {
  return res.render('reports')
})

router.post('/getAllCsv', (req, res) => {
  let from = false
  let to = false
  if (req.body.from) from = moment(req.body.from, 'MM-DD-YYYY').toDate()
  if (req.body.to) to = moment(req.body.to, 'MM-DD-YYYY').toDate()

  getAllReports(from, to, (err, result) => {
    if (err) {
      return res.status(500).send()
    }

    const csvName = Date.now() + '.csv'
    const csvPath = path.join(config.csvFolderPath, csvName)

    for (let user in result) {
      var reports = result[user]
      var firstName = reports.firstName
      var lastName = reports.lastName
      delete reports.firstName
      delete reports.lastName
      generateCsv(csvPath, firstName, lastName, reports)
    }


    res.sendFile(csvPath)
  })
})

module.exports = router
