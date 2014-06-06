'use strict';

angular.module('choufleur')
  .controller('SensorsCtrl', ['$scope', '$http', 'session', '$location',
  	function ($scope, $http, session, $location) {

  	if (session.token) {
	  	$http.get('/sensors/' + session.token).success(function (response) {
	  		if (response.status === 'SUCCESS') {
		  		$scope.sensors = response.sensors;
	  		} else {
	  			alert(response.error);
	  			delete session.token;
				$location.path('/');
 	  		}
	  	});
  	} else {
		$location.path('/');
  	}


  }]);
