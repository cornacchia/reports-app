var database = require('./db')

module.exports = function (req, res, next) {
  var db = database.get()
  var username = req.session.passport.user

  db.collection('user').findOne({username: username}, function (err, user) {
    if (err) {
      console.error(err)
      return res.status(500).send('Error')
    }

    if (user.type === 'admin') {
      return next()
    } else {
      return res.redirect('/user')
    }
  })
}
