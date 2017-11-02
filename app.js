var wechat = require('./routes/wechat');
//var gatewayService = require('./routes/gatewayService');
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var config = require('./config/config.json');
var utils = require('./utils');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var mq = require('./mqtt/mq');  
var UserEntity = require('./models/user').UserEntity; 
mq = mq();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret:'12345',
	resave:false,
	saveUninitialized:true,
	cookie:{maxAge:60*1000},
	}));




//app.use(utils.sign(config));
//app.use('/api', gatewayService);
app.use('/', wechat);
/// catch 404 and forwarding to error handler

/// error handlers

// development error handler
// will print stacktrace

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
