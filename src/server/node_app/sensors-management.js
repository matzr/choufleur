var events = require('events');
var util = require("util");
var sensors = {};

function Sensor(sensorId) {
  var self = this; 
  var sensorSocket;
  
  events.EventEmitter.call(self);

  self.sensorId = sensorId;

  function emitLocalAccessDetails() {
    if (self.localIp && self.authToken) {
      self.emit('localAccessDetailsUpdated', {
        localIp: self.localIp,
        authToken: self.authToken
      });
    }
  }

  self.requestLocalIp = function () {
    if (sensorSocket) {
      sensorSocket.emit('local_ip');
    }
  }

  self.cameOnline = function(socket) {
  	sensorSocket = socket;
  	self.emit('online');

    socket.on('local_ip', function (data) {
      self.localIp = data;
      self.emit('localIpUpdated');
      emitLocalAccessDetails();
    })

    socket.on('auth_token', function (data) {
      self.authToken = data;
      self.emit('authTokenUpdated');
      emitLocalAccessDetails();
    })

    socket.on('disconnect', function() {
      delete sensorSocket;
      self.emit('offline');
    });
  }

  self.requestAccess = function(socket) {
    delete self.authToken;
    delete self.localIp;
    if (sensorSocket) {
      sensorSocket.emit('local_ip');
      sensorSocket.emit('auth_token');
    }
  }  
}

util.inherits(Sensor, events.EventEmitter);

module.exports.get = function (sensorId) {
  if (typeof sensors[sensorId] === 'undefined') {
    sensors[sensorId] = new Sensor(sensorId);
  }
  return sensors[sensorId];
}

module.exports.isOnline = function(sensorId) {
	return (typeof sensors[sensorId] !== 'undefined') &&  (typeof sensors[sensorId].socket !== 'undefined');
};
