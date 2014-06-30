(function() {
  'use strict';

  angular.module('choufleur.directives')
    .directive('mgModalDialog', function() {

      return {
        restrict: 'E',
        scope: {
          show: '='
        },
        replace: true, // Replace with the template below
        transclude: true, // we want to insert custom content inside the directive
        link: function(scope, element, attrs) {
          scope.dialogStyle = {};
          if (attrs.width)
            scope.dialogStyle.width = attrs.width;
          if (attrs.height)
            scope.dialogStyle.height = attrs.height;
          scope.hideModal = function() {
            scope.show = false;
          };
        },
        templateUrl: 'views/directives/mg-modal-dialog.html' 
      };
    })
})();