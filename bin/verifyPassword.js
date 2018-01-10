const database = require('./db')
const encrypt = require('./encrypt')

function verifyPassword (username, password, done) {
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
}

module.exports = verifyPassword
