var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
//var helmet = require('helmet'); // middleware package. It can set appropriate HTTP headers that help protect your app from well-known web vulnerabilities
var compression = require('compression'); // compress html page (reduce the time)

var indexRouter = require('./routes/routing_handler'); // render di html-page
var app_interface = require('./routes/app_handler');
var user_interface = require('./routes/user_handler');
var data_interface = require('./routes/data_handler');
var hardware_interface = require('./routes/hardware_handler');

var app = express();
//app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json()); ////are built-in middleware functions to support JSON-encoded and URL-encoded bodies.
app.use(express.urlencoded({ extended: true })); //are built-in middleware functions to support JSON-encoded and URL-encoded bodies.
app.use(cookieParser()) // parse dei cookies / setta e legge (vedi note).
//app.use(session({secret: "Shh, its a secret!"}));
app.use(session({
secret: process.env.SESSION_SECRET,
saveUninitialized: true,
resave: false
}));

// le route di seguito vengono tutte compresse
app.use(compression());
app.use(express.static(path.join(__dirname, 'public'))); // path delle risorse statiche (image/vendor/js-library)
app.use('/', indexRouter);
app.use('/app', app_interface);
app.use('/user', user_interface);
app.use('/data', data_interface);
app.use('/hardware', hardware_interface);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
