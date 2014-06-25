'use strict';

angular.module('choufleur')
    .controller('LogonCtrl', ['$scope', '$http', 'session', '$location', 'socket',
        function($scope, $http, session, $location, socket) {
            if (session.token) {
                $location.path('/sensors')
            } else {
                var bcrypt = new bCrypt();

                $scope.logon = function() {
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
                                    $location.path('/sensors');
                                    socket.emit('user_connected', session.token);
                                } else {
                                    alert(response.error);
                                }
                            });
                        }, function() {});
                    });
                }
            }
        }

    ]);
