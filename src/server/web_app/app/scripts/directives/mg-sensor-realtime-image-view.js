  'use strict';

  angular.module('choufleur.directives')
    .directive('mgSensorRealtimeImageView', function() {

      return {
        replace: true,
        restrict: 'E',
        scope: {
          url: '=',
          refreshRate: '='
        },
        templateUrl: 'views/directives/mg-sensor-realtime-view.html',
        controller: ['$scope', '$interval',
          function($scope, $interval) {
            function displayImage() {
              $scope.nonCachedUrl = $scope.url + '/' + (+(new Date()));
            }

            $interval(displayImage, $scope.refreshRate * 1000);
          }
        ]
      }
    });
