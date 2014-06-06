'use strict';

angular.module('choufleur')
    .controller('RegisterUserCtrl', ['$scope', '$http',
        function($scope, $http) {

            $scope.register = function() {
                $http.post('/auth/register', {
                    username: $scope.username,
                    sha1password: CryptoJS.SHA1($scope.password).toString()
                }).success(function(response) {
                    alert(JSON.stringify(response));
                });
            }
        }
    ]);
