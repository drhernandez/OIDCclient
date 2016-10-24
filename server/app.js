var request = require('request');
// var session = require('express-session');
var url = require('url');
// var RedisStore = require('connect-redis')(session);
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
// var config = require('/etc/service-config/service');
// var config = require('/etc/nodejs-config/yuli2admin');
// var oidcConfig = config.oidc;
var qs = require('querystring');
const issuer = require('openid-client').Issuer;

var config = {
                //  "backend": "http://cendraws.unc.edu.ar/api/v1",
                 "issuer": {
                         "issuer": "http://yuli2ws.unc.edu.ar",
                         "authorization_endpoint": "http://yuli2.unc.edu.ar/oidc/auth",
                         "token_endpoint": "http://yuli2.unc.edu.ar/oidc/token",
                         "userinfo_endpoint": "http://yuli2.unc.edu.ar/oidc/info",
                         "token_introspection_endpoint": "http://yuli2.unc.edu.ar/oidc/introspect"
                 },
                 "creds": {
                         "client_id": "5806224acdb45695dc1d8b74",
                          "client_secret": "123456",
                         "id_token_signed_response_alg": "HS256"
                 },
                 "redis": {
                         "host": "redis",
                         "port": 6379
                 }
            }

////////////////////////////////////////////////
/////        SET OIDC ISSUER: YULI         /////
////////////////////////////////////////////////
// var yuliIssuer = new Issuer({
//   issuer: 'http://localhost:3012',
//   authorization_endpoint: 'http://localhost:3012/oidc/auth',
//   token_endpoint: 'http://localhost:3012/oidc/token',
//   userinfo_endpoint: 'http://localhost:3012/oidc/userinfo'
// });

var yuliIssuer = new issuer(config.issuer);
var oidc = new yuliIssuer.Client(config.creds);

// const client = new yuliIssuer.Client({
//   client_id: '5806224acdb45695dc1d8b74',
//   client_secret: '123456'
// }); // => Client

// const client = new yuliIssuer.Client({
//   client_id: "zELcpfANLqY7Oqas",
//   client_secret: "TQV5U29k1gHibH5bx1layBo0OSAvAbRT3UYW3EWrSYBB5swxjVfWUa1BS8lqzxG/0v9wruMcrGadany3"
// }); // => Client


request.debug=false;
// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();


/////////////////////////////LOGS/////////////////////////
var logMiddleware = function() {
  return function(req, res, next) {

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // console.log(ip);
    req.log = function () {
        var first_parameter = arguments[0];
        var other_parameters = Array.prototype.slice.call(arguments, 1);

        function formatConsoleDate (date) {
            var hour = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            var milliseconds = date.getMilliseconds();
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();

            return ip+' [' +
                day+
                '/'+
                month+
                '/'+
                year+
                ' '+
                   ((hour < 10) ? '0' + hour: hour) +
                   ':' +
                   ((minutes < 10) ? '0' + minutes: minutes) +
                   ':' +
                   ((seconds < 10) ? '0' + seconds: seconds) +
                   //'.' +
                   //('00' + milliseconds).slice(-3) +
                   '] ';
        }

        console.log.apply(console, [formatConsoleDate(new Date()) + first_parameter].concat(other_parameters));
    };

    next();
  };
};



// app.use(function(req, res, next) {
//   if (!req.session.uid) {
//     req.session.uid = Math.random();
//   }
//   req.log(req.session.uid);
//   next();
// });


// app.use(function(req, res, next){
//   return res.redirect('http://localhost:3012/oidc/auth');
//   // if(!req.session.user) return res.redirect('http://yuli2.unc.edu.ar/oidc/auth');
// });

app.use('/bower_components', express.static(path.join(__dirname, '..', 'bower_components')));
app.use('/', express.static(path.join(__dirname, '..', 'app')));

// app.use('/loged', isLoggeIn(req, res, next), express.static(path.join(__dirname, '..', 'app2')));
//
// function isLoggeIn(req, res, next) {
//   next();
// }

app.use(logMiddleware());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());


app.use('/oidc/auth', function (req, res, next) {
  var authUrl = oidc.authorizationUrl({
                  redirect_uri: 'http://localhost:9000/oidc/authCb',
                  scope: 'openid',
                }); // => String
  return res.redirect(authUrl);
})

// oidc.get('/authCb', function (req, res, next) {
app.use('/oidc/authCb', function (req, res, next) {
  console.log('req.query.code: ' + req.query.code);
  // oidc.authorizationCallback('http://localhost:9000/oidc/authCb', req.query) // => Promise
  // .then(function (tokenSet) {
  //   console.log('received tokens %j', tokenSet);
  // });
  return res.redirect('/#/about');
});


app.listen(9000);//config.port||9000);
// app.listen(9000);//config.port||9000);
