var events = require('events');
var util = require("util");
var sensors = {};

function Sensor(sensorId) {
  var self = this; 
  var sensorSocket;
  
  events.EventEmitter.call(self);

  self.sensorId = sensorId;

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
    })

    socket.on('auth_token', function (data) {
      self.authToken = data;
      self.emit('authTokenUpdated');
    })

    socket.on('disconnect', function() {
      delete sensorSocket;
      self.emit('offline');
    });

    socket.emit('local_ip');
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
