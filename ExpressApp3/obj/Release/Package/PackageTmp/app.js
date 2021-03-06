﻿'use strict';
const controller = require('./controllers/controller');
const crypto = require('crypto');
var debug = require('debug');
var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const keys = require('./config/keys')
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const indexRoutes = require('./routes/index');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
//const cookieSession = require('cookie-session');
const passport = require('passport');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Connect to mongodb
mongoose.connect(keys.mongodb.dbURI, {
    useNewUrlParser: true,
    auth: {
        user: keys.mongodb.username,
        password: keys.mongodb.password,
    }
}, function (err, db) {
    if (err) throw err;
    console.log('Connected to MongoDB');
}
);
var db = mongoose.connection;

/*
// Setup Cookies
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
})) */
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: (4 * 60 * 60 * 1000) },
    store: new MongoStore({
        mongooseConnection: db
    })
}));

// Initialize Passport and Cookies
app.use(passport.initialize());
app.use(passport.session());

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// setup routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

console.log(db);
console.log('-----------------------hi---------------------');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);


/*
app.use(session({
    secret: keys.session.cookieKey,
    saveUninitialized: true,
    resave: false,
    cookie:
    {
        maxAge: 60000
    },
    store: new MongoStore({
        mongooseConnection: db
    })
}))
*/
controller(app);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});

function genuuid(callback) {
    if (typeof (callback) !== 'function') {
        return uuidFromBytes(crypto.randomBytes(16));
    }

    crypto.randomBytes(16, function (err, rnd) {
        if (err) return callback(err);
        callback(null, uuidFromBytes(rnd));
    });
}

function uuidFromBytes(rnd) {
    rnd[6] = (rnd[6] & 0x0f) | 0x40;
    rnd[8] = (rnd[8] & 0x3f) | 0x80;
    rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
    rnd.shift();
    return rnd.join('-');
}

/*
 * TODO: 
 * Refresh  credentials in keys file: google, facebook, 
 * Add elasticsearch CRUD form for editing translations
 * Add flash messages for login-required redirects
 * Add indicator for translation type above each translation
 * Add login capability for Facebook and Twitter
 * Do something after Request has been successfully posted
 * Fix voting system (research how)
 * Generate a random username for users, allow them to change it in profile page
 * 
 * 
 */