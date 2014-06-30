  'use strict';

  angular.module('choufleur.directives')
    .directive('mgSensorRealtimeImageView', function() {

      return {
        replace: true,
        restrict: 'E',
        scope: {
          sensor: '=',
          refreshRate: '='
        },
        templateUrl: 'views/directives/mg-sensor-realtime-view.html',
        controller: ['$scope', '$interval', 'socket', '$http',
          function($scope, $interval, socket, $http) {
            var stop;
            var sensorAccessDetails;
            var isLocalSensorReachable;

            //TODO: reask for sensor details every 30 seconds (?)
            //TODO: retry direct connection every 30 seconds


            setDeadSignal();

            function displayImage() {
              $scope.nonCachedUrl = $scope.url + '/' + (+(new Date()));
            }

            $scope.$on("$destroy", function() {
              removeSocketListeners();
              if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
              }
            });

            function setLocalMonitoringPicture() {
              $scope.url = 'http://' + sensorAccessDetails.localIp + ':21177/' + sensorAccessDetails.authToken + '/PIC'
            }

            function setDeadSignal() {
              $scope.url = '/images/no-signal.gif?';
            }

            function pingLocalSensor() {
              if (sensorAccessDetails) {
                $http.get('http://' + sensorAccessDetails.localIp + ':21177/' + sensorAccessDetails.authToken + '/PING').
                success(function (resp) {
                  if (resp === 'PONG') {
                    isLocalSensorReachable = true;
                    setLocalMonitoringPicture();
                  } else {
                    isLocalSensorReachable = false;
                    setDeadSignal();
                  }
                }).
                error(function () {
                  isLocalSensorReachable = false;
                  setDeadSignal();
                });
              }
            }

            function receivedSensorAccessDetails(accessDetails) {
                //TODO: as we receive those message, try to access sensors: add sensor-preview directive to the "monitoring wall"
                console.log('sensorAccessDetails received: \n\t\t' + JSON.stringify(accessDetails));
                if ($scope.sensor.sensor_id === accessDetails.sensorId) {
  //                $scope.sensorViews.push('http://' + accessDetails.localIp + ':21177/' + accessDetails.authToken + '/PIC');
                  sensorAccessDetails = accessDetails;
                  pingLocalSensor();
                }
            }

            function addSocketListeners() {
              socket.on('sensorAccessDetails', receivedSensorAccessDetails);
            }

            function removeSocketListeners() {
              socket.removeListener('sensorAccessDetails', receivedSensorAccessDetails);
            }

            stop = $interval(displayImage, $scope.refreshRate * 1000);
            addSocketListeners();
          }
        ]
      }
    });
