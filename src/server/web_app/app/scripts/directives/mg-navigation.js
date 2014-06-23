(function() {
    'use strict';

    angular.module('choufleur.directives')
        .directive('mgNavigation', function() {

            return {
                replace: true,
                restrict: 'E',
                templateUrl: 'views/directives/mg-navigation.html'
            }
        })
    })();