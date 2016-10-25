'use strict';

/**
 * @ngdoc function
 * @name oidcclientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the oidcclientApp
 */
angular.module('oidcclientApp')
  .controller('MainCtrl', [ '$http', '$window', 'socketFactory', '$scope', function ($http, $window, socketFactory, $scope) {

    var vm = this;
    vm.user = {};
    vm.socket = null;
    vm.closeSession = closeSession;

    function activate() {
      vm.socket = socketFactory.connect();
    }

    activate();

    function closeSession() {
      vm.socket.emit('closeSession');
      // window.location = "/";
      window.location.href = "/";
    }

    vm.socket.on('user info', function (user) {
      $scope.$apply(vm.user = user);
    });

  }]);
