'use strict';

angular.module('choufleur')
    .controller('SensorsRtMonitor', ['$scope', '$http', 'session', '$interval', '$location', 'socket',
        function($scope, $http, session, $interval, $location, socket) {
        	var stop;
            $scope.sensorViews = [];

        	function keepSessionAlive() {
        		$http.get('/ping/' + session.token);
        	}

            $http.get('/sensors/' + session.token).success(function(response) {
                if (response.status === 'SUCCESS') {
                    $scope.sensors = response.sensors;
                    socket.emit('request_sensors_access');
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



