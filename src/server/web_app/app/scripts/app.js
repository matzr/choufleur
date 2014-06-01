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
      .when('/', {
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
      .otherwise({
        redirectTo: '/'
      });
  });

  angular.module('choufleur.services', []);
  angular.module('choufleur.directives', []);
})();
