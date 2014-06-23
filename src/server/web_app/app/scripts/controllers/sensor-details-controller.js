'use strict';

angular.module('choufleur')
    .controller('SensorDetailsCtrl', ['$scope', '$routeParams', '$http', 'session', '$interval', '$location',
        function($scope, $routeParams, $http, session, $interval, $location) {
            $scope.sensorId = $routeParams.sensor_id;
            $scope.sensorName = $routeParams.sensor_name;

            var stop;

        	function keepSessionAlive() {
        		$http.get('/ping/' + session.token);
        	}

            $http.get('/sensors/' + session.token).success(function(response) {
                if (response.status === 'SUCCESS') {
                    $scope.sensors = response.sensors;
                     stop = $interval(keepSessionAlive, 5000);
                } else {
                    alert(response.error);
                    delete session.token;
                    $location.path('/');
                }
            });

            $scope.$on("$destroy", function() {
            	if (angular.isDefined(stop)) {
			        $interval.cancel(stop);
			        stop = undefined;
			      }
            });
        }
    ]);
