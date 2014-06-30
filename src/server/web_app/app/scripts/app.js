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
//    ,'ui.bootstrap'
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
      .when('/sensor/get_registration_token', {
        templateUrl: 'views/get-registration-token.html',
        controller: 'SensorRegistrationTokenCtrl'
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
      .when('/add-sensor', {
        templateUrl: 'views/add-sensor.html',
        controller: 'AddSensorCtrl'
      })
      .when('/sensors-rt-monitor', {
        templateUrl: 'views/sensors-rt-monitor.html',
        controller: 'SensorsRtMonitor'
      })
      .when('/notifications', {
        templateUrl: 'views/notifications.html',
        controller: 'NotificationsCtrl'
      })
      .otherwise({ 
        redirectTo: '/'
      });
  })
  .value('session', {});

  angular.module('choufleur.services', []);
  angular.module('choufleur.directives', []);
})();
