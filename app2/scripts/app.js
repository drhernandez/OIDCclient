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
  });

  // app.config(['$httpProvider', function($httpProvider) {
  //       $httpProvider.defaults.useXDomain = true;
  //       delete $httpProvider.defaults.headers.common['X-Requested-With'];
  //   }
// ]);
