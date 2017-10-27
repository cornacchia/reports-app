var express = require('express');
var expressSession = require('express-session')
var passport = require('./bin/passport')
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn
var ensureAdmin = require('./bin/ensureAdmin')
var database = require('./bin/db')
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors')
var config = require('./config')

var index = require('./routes/index')
var admin = require('./routes/admin')
var login = require('./routes/login')
var logout = require('./routes/logout')
var user = require('./routes/user')
var mobile = require('./routes/mobile')

var app = express();

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

app.use(cors())

app.use('/', index)
app.use('/admin', ensureLoggedIn('/'), ensureAdmin, admin)
app.use('/user', ensureLoggedIn('/'), user)
app.use('/mobile', mobile)
app.use('/login', login)
app.use('/logout', logout)

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
