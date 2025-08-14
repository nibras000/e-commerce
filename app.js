var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const MongoStore = require('connect-mongo');
 
var app = express();
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const hbs =require('express-handlebars');

const session = require('express-session');
// behind a proxy on Render → secure cookies work
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'dev_fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
};

// Use Mongo-backed sessions in production
if (process.env.MONGODB_URI) {
  sessionOptions.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 14 * 24 * 60 * 60 // 14 days
  });
}

app.use(session(sessionOptions));

const connectDB = require('./config/connection');
 

connectDB()



var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');



var fileUpload = require('express-fileupload');

const hbsHelpers = {
  ifCond: function (v1, operator, v2, options) {
    switch (operator) {
      case '==': return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===': return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '<': return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=': return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>': return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=': return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      default: return options.inverse(this);
    }
  }
};
const helmet = require('helmet');
app.use(helmet());

app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layout/',
    partialsDir: __dirname + '/views/partials/',
    helpers: hbsHelpers
  }));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

 

 
app.use('/', userRouter);
app.use('/admin', adminRouter);

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
