'use strict';

angular.module('choufleur')
    .controller('SensorDetailsCtrl', ['$scope', '$routeParams',
        function($scope, $routeParams) {
            $scope.sensorId = $routeParams.sensor_id;
            $scope.sensorName = $routeParams.sensor_name;
        }
    ]);
