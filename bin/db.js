var MongoClient = require('mongodb').MongoClient
var config = require('../config')

var _db

module.exports = {
  startConnection: function (cb) {
    MongoClient.connect(config.db.url, function (err, db) {
      if (err) {
        return cb(err)
      }

      console.log('Db connected')

      _db = db
      return cb()
    })
  },

  get: function () {
    return _db
  }
}