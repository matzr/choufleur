'use strict';

angular.module('choufleur')
  .controller('SensorRegistrationTokenCtrl', ['$scope', '$http', 'session', '$location',
    function($scope, $http, session, $location) {

      $http.get('/request_sensor_token/' + session.token).success(function(response) {
        if (response.status === 'SUCCESS') {
          $scope.sensorRegistrationToken = response.sensorRegistrationToken;
        } else {
          alert(response.error);
          delete session.token;
          $location.path('/');
        }
      });


    }

  ]);
