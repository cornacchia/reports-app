var express = require('express')
var database = require('../bin/db')
var router = express.Router()

/* GET user home page. */
router.get('/', function(req, res, next) {
  var db = database.get()
  
    db.collection('Misc').find({}).toArray(function (err, result) {
      var elements = {
        'vehicle': [],
        'site': []
      }
      for (var i in result) {
        elements[result[i].category].push(result[i])
      }
      return res.render('report', { title: 'Nuovo rapportino', elements: elements })
    })
})

module.exports = router