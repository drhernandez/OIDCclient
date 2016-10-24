'use strict';

/**
 * @ngdoc function
 * @name oidcclientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the oidcclientApp
 */
angular.module('oidcclientApp')
  .controller('MainCtrl', function ($http, $window) {

    var vm = this;

    vm.authRequest = authRequest;


    function authRequest() {
      return $window.location.href = '/oidc/auth';
    }

  });
