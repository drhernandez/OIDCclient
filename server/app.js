var request = require('request');
var session = require('express-session');
var url = require('url');
var RedisStore = require('connect-redis')(session);
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
// var config = require('/etc/service-config/service');
// var config = require('/etc/nodejs-config/yuli2admin');
// var oidcConfig = config.oidc;
var qs = require('querystring');
const issuer = require('openid-client').Issuer;


var config = {
                 "backend": "http://yuli2ws.unc.edu.ar/v1",
                 "issuer": {
                         "issuer": "http://yuli2ws.unc.edu.ar",
                         "authorization_endpoint": "http://yuli2.unc.edu.ar/oidc/auth",
                         "token_endpoint": "http://yuli2.unc.edu.ar/oidc/token",
                         "userinfo_endpoint": "http://yuli2.unc.edu.ar/oidc/info",
                         "token_introspection_endpoint": "http://yuli2.unc.edu.ar/oidc/introspect"
                 },
                 "creds": {
                         "client_id": "5806224acdb45695dc1d8b74",
                          "client_secret": "a435338f0757ccfc34d21e9eb0f88a8a",
                         "id_token_signed_response_alg": "HS256"
                 },
                 "redis": {
                         "host": "localhost",
                         "port": 6379
                        //  "host": "redis",
                        //  "port": 6379
                 }
            }

var defaultRequest = request.defaults({baseUrl: config.backend});


////////////////////////////////////////////////
/////        SET OIDC ISSUER: YULI         /////
////////////////////////////////////////////////
var yuliIssuer = new issuer(config.issuer);
var oidc = new yuliIssuer.Client(config.creds);


request.debug=false;
// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';


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

app.use(logMiddleware());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

var sessionMiddleware = session({
  secret: 'e56d30f4b6573499882ac643c2cbf29d',
  resave: false,
  saveUninitialized: false//,
  // store: new RedisStore(config.redis)
});

app.use(sessionMiddleware);


app.use('/bower_components', express.static(path.join(__dirname, '..', 'bower_components')));
app.use('/', express.static(path.join(__dirname, '..', 'app')));
// app.use('/', function (req, res, next) {
//     console.log(req.session); next();
// }, express.static(path.join(__dirname, '..', 'app')));
app.use('/loged', isLoggeIn, express.static(path.join(__dirname, '..', 'app2')));




app.use('/logout', logOut);
app.use('/oidc/auth', isLoggeIn);
app.use('/oidc/authCb', function (req, res, next) {

  oidc.authorizationCallback(req.protocol+'://'+req.headers.host+'/oidc/authCb', req.query)
  .then(function(tokenSet) {

        req.session.tokenSet = tokenSet;
      oidc.userinfo(tokenSet) // => Promise
      .then(function (userinfo) {
        req.session.user = userinfo;
        return res.redirect('/loged');
      })
      .catch(function (err) {
        console.log("userinfo err: ", err);
      });

  })
  .catch(function (err) {
    console.log("authorizationCb err: ", err);
  });

  // Promise.all([
  //   oidc.authorizationCallback(req.protocol+'://'+req.headers.host+'/oidc/authCb', req.query)
  //   .then(function(tokenSet) {
  //     req.session.tokenSet = tokenSet;
  //     return oidc.userinfo(tokenSet);
  //   })
  // ])
  // .then(function(r) {
  //   defaultRequest({url: '/?objInterface='+r[1]._id+'&user.externalId='+r[0].sub, headers: {authorization: 'Bearer '+req.session.tokenSet.access_token}}, function(error, response, body) {
  //     if(error) return res.status(500).send(error);
  //     var user;
  //     try {
  //       user = JSON.parse(body)[0];
  //     } catch(err) {
  //       return res.status(500).send(err);
  //     }
  //     // req.session.profile=r[0];
  //     // if(!user) {
  //     //   req.session.user='anonymous';
  //     //   return res.redirect('/#/notUser');
  //     // }
  //     req.session.user = user;
  //     console.log('user: ', req.session.user);
  //     res.redirect('/loged');
  //   });
  // })
  // .catch(function(err) {
  //   res.status(500).send(err);
  // });


});


function isLoggeIn(req, res, next) {
  // console.log('session: ', req.session);
  if (!req.session.user) {
    var authUrl = oidc.authorizationUrl({
                    redirect_uri: req.protocol+'://'+req.headers.host+'/oidc/authCb',
                    scope: 'openid',
                  }); // => String
    return res.redirect(authUrl);
  }
  else {
    next();
  }
}

function logOut(req, res, next) {
  req.session.destroy(function (err) {
    if (err) console.log(err);
    else {
      console.log("login out: ");
      res.redirect('http://yuli2.unc.edu.ar/logout?redirect_uri=' + req.protocol+'://'+req.headers.host);
    }
  });
}


io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

io.on('connection', function(socket){
  if (socket.request.session) {
    socket.emit('user info', socket.request.session.user);
  }

  socket.on('closeSession',function(){
    console.log("closing session");
    socket.request.session.destroy();
    // socket.request.res.redirect('/oidc/logout')
    // console.log("request: ", socket.request);
    // socket.request.session.user=null;
    // socket.request.session.save();
  });
});

// app.listen(9000)
server.listen(9000);//config.port||9000);
// app.listen(9000);//config.port||9000);
