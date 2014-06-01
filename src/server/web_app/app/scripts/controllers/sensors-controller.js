'use strict';

angular.module('choufleur')
  .controller('SensorsCtrl', ['$scope', '$http', function ($scope, $http) {

  	$http.get('/sensors').success(function (sensors) {
  		$scope.sensors = sensors;
  	});
  	

  }]);
