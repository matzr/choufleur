'use strict';

angular.module('choufleur')
    .controller('SensorsCtrl', ['$scope', '$http', 'session', '$location', '$interval', 'socket',
        function($scope, $http, session, $location, $interval, socket) {
            var stop;

            function keepSessionAlive() {
                $http.get('/ping/' + session.token);
            }

            if (session.token) {
                $http.get('/sensors/' + session.token).success(function(response) {
                    if (response.status === 'SUCCESS') {
                        $scope.sensors = response.sensors;
                        stop = $interval(keepSessionAlive, 30000);
                    } else {
                        alert(response.error);
                        delete session.token;
                        $location.path('/');
                    }
                });

            } else {
                $location.path('/');
            }

            function onSensorOnline(sensor) {
                var sensor = JSON.parse(sensor);
                changeOnlineStatus(sensor.sensorId, true);
            }

            function onSensorOffline(sensor) {
                var sensor = JSON.parse(sensor);
                changeOnlineStatus(sensor.sensorId, false);
            }

            socket.on('sensor_online', onSensorOnline);
            socket.on('sensor_offline', onSensorOffline);

            $scope.$on('$destroy', function() {
                if (angular.isDefined(stop)) {
                    $interval.cancel(stop);
                    stop = undefined;
                }
            });

            function changeOnlineStatus(sensorId, newStatus) {
                var userSensors = _.where($scope.sensors, {sensor_id: sensorId});
                if (userSensors.length === 1) {
                    userSensors[0].is_online = newStatus;
                    $scope.$apply();
                }
                socket.removeListener('sensor_online', onSensorOnline);
                socket.removeListener('sensor_offline', onSensorOffline);
            }

        }
    ]);
