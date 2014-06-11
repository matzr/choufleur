'use strict';

angular.module('choufleur')
    .controller('SensorsCtrl', ['$scope', '$http', 'session', '$location', '$interval',
        function($scope, $http, session, $location, $interval) {
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

            $scope.$on("$destroy", function() {
                if (angular.isDefined(stop)) {
                    $interval.cancel(stop);
                    stop = undefined;
                }
            });


        }
    ]);
