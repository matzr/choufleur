(function() {
  'use strict';

  angular.module('choufleur.services')
    .factory('socket', function() {
      var socket = io.connect();

      return {
        on: _.bind(socket.on, socket),
        emit: _.bind(socket.emit, socket),
        removeListener: _.bind(socket.removeListener, socket),
        removeAllListeners: _.bind(socket.removeAllListeners, socket)
      }
    })
})();
