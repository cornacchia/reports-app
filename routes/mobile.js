const express = require('express')
const async = require('async')
const path = require('path')
const fs = require('fs')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const busboy = require('connect-busboy')
const database = require('../bin/db')
const verify = require('../bin/verifyPassword')
const mobileLoggedIn = require('../bin/mobileLoggedIn')
const dateToString = require('../bin/dateToString')
const ensureDirExistence = require('../bin/ensureDirExistence')
const config = require('../config')
const router = express.Router()

const TOKEN_EXPIRE = 60 * 60 * 24 * 7

/* Login */
router.post('/login', (req, res) => {
  if (req.body.username && req.body.password) {
    verify(req.body.username, req.body.password, (err, user) => {
      if (err) {
        return res.status(500).send()
      }
      if (!user) {
        return res.status(404).send()
      }

      const payload = { username: user.username }
      const token = jwt.sign(payload, config.mobile.secret, { expiresIn: TOKEN_EXPIRE })

      res.status(200).send({authToken: token, username: user.username, firstName: user.firstName, lastName: user.lastName})

    })
  }
})

/* Get db select data */
router.post('/select',
mobileLoggedIn,
(req, res) => {
  var db = database.get()

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
    },
    highway: highwayCb => {
      db.collection('highwayOptions')
      .find({})
      .toArray((err, result) => {
        if (err) {
          console.error(err)
          return highwayCb(err)
        }

        return highwayCb(null, result)
      })
    },
    user: userCb => {
      db.collection('user')
      .find({})
      .project({_id: -1, firstName: 1, lastName: 1})
      .toArray((err, result) => {
        if (err) {
          console.error('Error retrieving user data from db for mobile select', err)
          return userCb(err)
        }

        return userCb(null, result)
      })
    }
  }, (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send()
    }

    return res.status(200).send(results)
  })
})

/* Post new report */
router.post('/report',
mobileLoggedIn,
(req, res) => {
  const db = database.get()
  const generalData = {
    username: req.headers.username,
    site: req.headers.site,
    ts: new Date(),
    date: moment().format('D MMMM YYYY'),
    meteo: req.body.meteo,
    squad: req.body.squad,
    workStarted: new Date(req.body.workStarted),
    workPause: req.body.workPause,
    workStopped: new Date(req.body.workStopped),
    travelTime: parseInt(req.body.travelTime),
    workTime: parseInt(req.body.workTime),
    notes: req.body.notes
  }

  db.collection('report').insertOne(generalData, err => {
    if (err) {
      console.error(err)
      return res.status(500).send()
    }

    return res.status(200).send()
  })
})

/* Post new vehicle info */
router.post('/vehicle',
mobileLoggedIn,
(req, res) => {
  const db = database.get()
  let vehicleData = {
    username: req.headers.username,
    site: req.headers.site,
    ts: new Date(),
    date: moment().format('D MMMM YYYY'),
    vehicle: req.body.vehicle,
    vehicleKm: req.body.vehicleKm,
  }

  async.waterfall([
     enterCb => {
      const highwayEnter = req.body.highwayEnter.toUpperCase()
      db.collection('highwayOptions')
      .updateOne({name: highwayEnter}, {$set: {name: highwayEnter}}, {upsert: true}, err => {
        if (err) {
          console.error(err)
          return enterCb(err)
        }

        return enterCb(null, highwayEnter)
      })
    },
    (highwayEnter, exitCb) => {
      const highwayExit = req.body.highwayExit.toUpperCase()
      db.collection('highwayOptions')
      .updateOne({name: highwayExit}, {$set: {name: highwayExit}}, {upsert: true}, err => {
        if (err) {
          console.error(err)
          return exitCb(err)
        }

        return exitCb(null, highwayEnter, highwayExit)
      })
    }
  ], (err, highwayEnter, highwayExit) => {
    if (err) {
      return res.status(500).send()
    }

    vehicleData['highwayEnter'] = highwayEnter
    vehicleData['highwayExit'] = highwayExit
    db.collection('vehicle').insertOne(vehicleData, err => {
      if (err) {
        console.error(err)
        return res.status(500).send()
      }

      return res.status(200).send()
    })
  })
})

/* Post new audio */
router.post('/audio',
mobileLoggedIn,
(req, res) => {
  const db = database.get()
  const date = dateToString(new Date())
  const site = req.headers.site
  let saveTo = ''

  const siteFolder = path.join(config.audioFolderPath, site)
  const siteDateFolder = path.join(siteFolder, date)
  ensureDirExistence(siteFolder)
  ensureDirExistence(siteDateFolder)
  let publicBase = path.join(config.audioPublicPath, site, date)

  req.pipe(req.busboy)
  req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    saveTo = path.join(siteDateFolder, filename)
    publicPath = path.join(publicBase, filename)
    file.pipe(fs.createWriteStream(saveTo))
  })

  req.busboy.on('finish', () => {
    const audioData = {
      user: req.headers.username,
      site: req.headers.site,
      date: new Date(),
      file: saveTo,
      path: publicPath
    }
    db.collection('audio').insertOne(audioData, err => {
      if (err) {
        console.error(err)
      }

      return res.status(200).send()
    })
  })
})

/* Post new picture */
router.post('/picture',
mobileLoggedIn,
(req, res) => {
  const db = database.get()
  const date = dateToString(new Date())
  const site = req.headers.site
  let saveTo = ''

  const siteFolder = path.join(config.pictureFolderPath, site)
  const siteDateFolder = path.join(siteFolder, date)

  ensureDirExistence(siteFolder)
  ensureDirExistence(siteDateFolder)
  let publicBase = path.join(config.picturePublicPath, site, date)

  req.pipe(req.busboy)
  req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    saveTo = path.join(siteDateFolder, filename) + '.jpg'
    publicPath = path.join(publicBase, filename) + '.jpg'
    file.pipe(fs.createWriteStream(saveTo))
  })
  req.busboy.on('finish', () => {
    const pictureData = {
      user: req.headers.username,
      site: req.headers.site,
      date: new Date(),
      file: saveTo,
      path: publicPath
    }

    db.collection('picture').insertOne(pictureData, err => {
      if (err) {
        console.error(err)
      }

      return res.status(200).send()
    })
  })
})

module.exports = router
