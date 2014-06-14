'use strict';

angular.module('choufleur')
  .controller('RegisterUserCtrl', ['$scope', '$http', 'session', 'socket', '$location',
    function($scope, $http, session, socket, $location) {

      $scope.register = function() {
        $http.post('/auth/register', {
          username: $scope.username,
          sha1password: CryptoJS.SHA1($scope.password).toString()
        }).success(function(response) {
          if (response.status === 'FAILURE') {
            alert('Registration failed: ' + response.error);
          } else {
            logon();
          }
        });
      }

      var bcrypt = new bCrypt();

      function logon() {
        $http.get('/auth/challenge').success(function(response) {
          $scope.challenge_part1 = response.challenge_part1;
          $scope.challenge_part2 = response.challenge_part2;
          $scope.salt = response.salt;
          console.log(CryptoJS.SHA1($scope.password).toString());
          bcrypt.hashpw(CryptoJS.SHA1($scope.password).toString() + $scope.challenge_part1 + $scope.challenge_part2, $scope.salt, function(hash) {
            $http.post('/auth', {
              challenge_part1: $scope.challenge_part1,
              challenge_part2: $scope.challenge_part2,
              salt: $scope.salt,
              username: $scope.username,
              password: hash
            }).success(function(response) {
              if (response.status === 'SUCCESS') {
                session.token = response.token;
                $scope.registrationSucceeded = true;
              } else {
                alert('Registration failed: ' + response.error);
              }
            });
          }, function() {});
        });
      }

      socket.on('sensorTokenUsed', function (data) {
        if ($scope.sensorToken + '' === data.sensorToken + '') {
            $location.path('/sensors');
            $scope.$apply();
        }
      });

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
    }
  ]);
