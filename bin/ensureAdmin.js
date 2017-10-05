var database = require('./db')

module.exports = function (req, res, next) {
  var db = database.get()
  var username = req.session.passport.user

  db.collection('User').findOne({username: username}, function (err, user) {
    if (err) {
      console.error(err)
      return res.serverError()
    }

    if (user.type === 'admin') {
      return next()
    } else {
      return res.redirect('/user')
    }
  })
}
