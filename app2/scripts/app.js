'use strict';

/**
 * @ngdoc overview
 * @name oidcclientApp
 * @description
 * # oidcclientApp
 *
 * Main module of the application.
 */
angular
  .module('oidcclientApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngMaterial'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .factory('socketFactory', function(){

    var socketFactory = {};
    var socket = null;

    socketFactory.connect = function(){
      if (!socket) {
        socket = io.connect();
      }
      return socket;
    };

    socketFactory.getSocket = function(){
      return socket;
    };

    socketFactory.closeSession = function(){
      socket.emit('closeSession');
      // window.location = "/";
      window.location.href = "http://openid.unc.edu.ar:8080/openaselect/sso/user/logout";
    };

    return socketFactory;

  });

  // app.config(['$httpProvider', function($httpProvider) {
  //       $httpProvider.defaults.useXDomain = true;
  //       delete $httpProvider.defaults.headers.common['X-Requested-With'];
  //   }
// ]);
