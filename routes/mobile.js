var express = require('express')
var passport = require('../bin/passport')
var database = require('../bin/db')
var router = express.Router()

/* Get db select data */
router.get('/select',
function(req, res) {
  var db = database.get()

  db.collection('Misc').find({}).toArray(function (err, result) {
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
