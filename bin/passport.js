const passport = require('passport')
const database = require('./db')
const encrypt = require('./encrypt')
const LocalStrategy = require('passport-local')

// passport configuration
passport.use(new LocalStrategy((username, password, done) => {
  const db = database.get()
  db.collection('user').findOne({username: username}, (err, user) => {
    if (err) {
      return done(err)
    } else if (!user) {
      return done(null, false)
    } else {
      const cryptoPassword = encrypt(password)
      if (user.password === cryptoPassword) {
        return done(null, user)
      }
      return done(null, false)
    }
  })
}))

passport.serializeUser((user, done) => {
  done(null, user.username)
})

passport.deserializeUser((username, done) => {
  const db = database.get()
  db.collection('user').findOne({username: username}, function (err, user) {
    done(err, user)
  })
})

module.exports = passport
