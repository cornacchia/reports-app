/** Setup db connection and provides a db handler for the application */

const MongoClient = require('mongodb').MongoClient
const config = require('../config')

let _db

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