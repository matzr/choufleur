'use strict';

angular.module('choufleur')
    .controller('SensorsOverviewCtrl', ['$scope', '$http', 'session',
        function($scope, $http, session) {
            $http.get('/sensors/' + session.token).success(function(response) {
                $scope.sensors = response.sensors;
            });
        }
    ]);
