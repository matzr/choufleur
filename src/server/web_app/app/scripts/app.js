(function() {
  'use strict';

angular
  .module('choufleur', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'choufleur.services',
    'choufleur.directives'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/sensors', {
        templateUrl: 'views/sensors.html',
        controller: 'SensorsCtrl'
      })
      .when('/sensor/:sensor_id/:sensor_name', {
        templateUrl: 'views/sensor-details.html',
        controller: 'SensorDetailsCtrl'
      })
      .when('/sensors-overview', {
        templateUrl: 'views/sensors-overview.html',
        controller: 'SensorsOverviewCtrl'
      })
      .when('/', {
        templateUrl: 'views/logon.html',
        controller: 'LogonCtrl'
      })
      .when('/register', {
        templateUrl: 'views/register-user.html',
        controller: 'RegisterUserCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .value('session', {});

  angular.module('choufleur.services', []);
  angular.module('choufleur.directives', []);
})();
