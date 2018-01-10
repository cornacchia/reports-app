const express = require('express')
const database = require('../bin/db')
const selectConfig = require('../bin/selectConfig')
const combineHours = require('../bin/combineHours')
const router = express.Router()

/* GET user home page. */
router.get('/', (req, res, next) => {
  const db = database.get()

  db.collection('Misc').find({}).toArray(function (err, result) {
    let elements = {
      'vehicle': [],
      'site': []
    }

    for (var i in result) {
      elements[result[i].category].push(result[i])
    }
    return res.render('report', {
      title: 'Nuovo rapportino',
      elements: elements,
      minutes: selectConfig.minutes,
      dayHours: selectConfig.dayHours,
      durationHours: selectConfig.durationHours })
  })
})

router.post('/report', (req, res, next) => {
  const db = database.get()

  let newReport = {
    user: req.session.passport.user,
    date: new Date(),
    time: req.body.time,
    site: req.body.site,
    workStarted: combineHours(req.body.workStartedHour, req.body.workStartedMinutes),
    workPaused: combineHours(req.body.workPausedHour, req.body.workPausedMinutes),
    workStopped: combineHours(req.body.workStoppedHour, req.body.workStoppedMinutes),
    travelTime: req.body.travelTime,
    workHours: req.body.workHours,
    vehicle: req.body.vehicle,
    vehicleKm: req.body.vehicleKm,
    highwayEnter: combineHours(req.body.highwayEnterHour, req.body.highwayEnterMinutes),
    highwayExit: combineHours(req.body.highwayExitHour, req.body.highwayExitMinutes),
    workDescription: req.body.workDescription,
    notes: req.body.notes
  }

  db.collection('Reports').insertOne(newReport, err => {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }

    return res.redirect('/user')
  })
})

module.exports = router