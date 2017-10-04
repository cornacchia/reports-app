var express = require('express');
var expressSession = require('express-session')
var passport = require('passport')
var scrypt = require('scryptsy')
var LocalStrategy = require('passport-local')
var database = require('./bin/db')
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config')

var index = require('./routes/index')
var admin = require('./routes/admin')
var login = require('./routes/login')
var user = require('./routes/user')

var app = express();

// passport configuration
passport.use(new LocalStrategy(function (username, password, done) {
  var db = database.get()
  db.collection('User').findOne({username: username}, function (err, user) {
    if (err) {
      return done(err)
    } else if (!user) {
      return done(null, false)
    } else {
      var cryptoPassword = scrypt(
        password,
        config.scrypt.salt,
        config.scrypt.N,
        config.scrypt.r,
        config.scrypt.p,
        config.scrypt.lenBytes
      ).toString('hex')

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
  db.collection('User').findOne({username: username}, function (err, user) {
    done(err, user)
  })
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({secret: config.secret, resave: false, saveUninitialized: false}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/', index)
app.use('/admin', admin)
app.use('/login', login)
app.use('/user', user)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
