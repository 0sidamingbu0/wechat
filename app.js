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
var token = require('./service/token');
var Promise = require("bluebird");
var gatewayService=require('./service/gatewayService');



//20200914log增加时间
require('date-utils');
console.log=(function() {
      var orig = console.log;
      return function() {
        try {
          var tmp=process.stdout;
          process.stdout=process.stderr;
          // get now
          var now = new Date();
          // format time
          var now_formated = now.toFormat("YYYY-MM-DD HH24:MI:SS");
          var strDate = '[' + now_formated + '] ';
          if (Buffer.isBuffer(arguments[0])) {
            arguments[0] = strDate + arguments[0];
          } else if (typeof arguments[0] !== 'object') {
            arguments[0] = strDate + arguments[0];
          } else if (typeof arguments[0] === 'object') {
            arguments[0] = strDate + JSON.stringify(arguments[0]);
          }
          orig.apply(console, arguments);
        } finally {
          process.stdout=tmp;
        }
    };
})();








mq.mqinit();


var promise = new Promise(function(resolve, reject) {
 if (token.gettoken()==1){
 resolve();
 } else {
 reject();
 }
});

promise.then(function() {
 // success
 	console.log("token: "+global.token)
    gatewayService.sendmsg('oZWQZwz6-YeMqo8-3OOrL3JgdXMg','云端服务启动');
}, function() {
 // failure
});
        




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
