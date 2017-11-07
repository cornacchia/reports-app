var express = require('express')
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const busboy = require('connect-busboy')
var database = require('../bin/db')
var verify = require('../bin/verifyPassword')
const mobileLoggedIn = require('../bin/mobileLoggedIn')
const config = require('../config')
var router = express.Router()

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

  db.collection('Misc').find({}).toArray((err, result) => {
    if (err) {
      res.status(500).send(err)
    }
    var elements = {
      'vehicle': [],
      'site': []
    }
    for (var i in result) {
      elements[result[i].category].push(result[i])
    }
    return res.send(elements)
  })
})

/* Post new report */
router.post('/report',
mobileLoggedIn,
(req, res) => {
  console.log(req.body.report)
  return res.status(200).send()
})

/* Post new audio */
router.post('/audio',
mobileLoggedIn,
(req, res) => {
  req.pipe(req.busboy)
  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log('saving file', filename)
    const saveTo = path.join(config.audioFolderPath, filename)
    file.pipe(fs.createWriteStream(saveTo))
  });
  req.busboy.on('finish', function() {
    res.status(200).send()
  })
})

/* Post new picture */
router.post('/picture',
mobileLoggedIn,
(req, res) => {
  req.pipe(req.busboy)
  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log('saving file', filename)
    const saveTo = path.join(config.pictureFolderPath, filename)
    file.pipe(fs.createWriteStream(saveTo))
  });
  req.busboy.on('finish', function() {
    res.status(200).send()
  })
})

module.exports = router
