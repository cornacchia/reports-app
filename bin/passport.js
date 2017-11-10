var passport = require('passport')
var database = require('./db')
var encrypt = require('./encrypt')
var LocalStrategy = require('passport-local')

// passport configuration
passport.use(new LocalStrategy(function (username, password, done) {
  var db = database.get()
  db.collection('user').findOne({username: username}, function (err, user) {
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
}))

passport.serializeUser(function (user, done) {
  done(null, user.username)
})

passport.deserializeUser(function(username, done) {
  var db = database.get()
  db.collection('user').findOne({username: username}, function (err, user) {
    done(err, user)
  })
})

module.exports = passport
