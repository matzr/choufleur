'use strict';

angular.module('choufleur')
  .controller('AddSensorCtrl', ['$scope', '$http', 'session', '$location', 'socket',
    function($scope, $http, session, $location, socket) {

      $scope.requestToken = function() {
        $http.get('/request_sensor_token/' + session.token).
        success(function(response) {
          if (response.status == 'SUCCESS') {
            $scope.sensorToken = response.sensorRegistrationToken;
          } else {
            alert('An error occured: ' + response.error);
          }
        }).
        error(function() {
          alert('An error occured, please try again later');
        });
      }

      socket.on('sensorTokenUsed', function(data) {
        if ($scope.sensorToken + '' === data.sensorToken + '') {
          $location.path('/sensors');
          $scope.$apply();
        }
      });

    }

  ]);
