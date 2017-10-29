var express = require('express')
const jwt = require('jsonwebtoken')
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

      res.status(200).send(token)

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
module.exports = router
