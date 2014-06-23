var events = require('events');
var stringify = require('json-stringify-safe');
var users = {};

function User(userUid) {
  var self = this;
  var sensors = {};
  var userSocket; 
  
  events.EventEmitter.call(self);

  self.userUid = userUid;

  this.setSocket = function(socket) {
    userSocket = socket;

    socket.on('disconnect', function() {
      delete userSocket;
    });
  }

  this.addSensor = function(sensor) {
    sensors[sensor.sensorId] = sensor;
    sensor.on('online', function() {
      if (userSocket) {
        userSocket.emit('sensor_online', stringify(sensor));
      }
    });
    sensor.on('offline', function() {
      if (userSocket) {
        userSocket.emit('sensor_offline', stringify(sensor));
      }
    });
  }
}

User.prototype.__proto__ = events.EventEmitter.prototype;

module.exports.get = function(userUid) {
  if (!users[userUid]) {
    users[userUid] = new User(userUid);
  }
  return users[userUid];
};
