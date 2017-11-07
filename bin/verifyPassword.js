var database = require('./db')
var encrypt = require('./encrypt')

function verifyPassword (username, password, done) {
  var db = database.get()
  db.collection('User').findOne({username: username}, function (err, user) {
    if (err) {
      return done(err)
    } else if (!user) {
      return done(null, false)
    } else {
      var cryptoPassword = encrypt(password)

      if (user.password === cryptoPassword) {
        return done(null, user)
      }
      return done(null, false)
    }
  })
}

module.exports = verifyPassword
