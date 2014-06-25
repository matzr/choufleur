var events = require('events');
var stringify = require('json-stringify-safe');
var _ = require('underscore');
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

    socket.on('request_sensors_access', function () {
      for (var sensorId in sensors) {
        sensors[sensorId].requestAccess();
      }
    });
  }

  this.addSensor = function(sensor) {
    if (!sensors[sensor.sensorId]) {
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
      sensor.on('localAccessDetailsUpdated', function (details) {
        userSocket.emit('sensorAccessDetails', _.extend(details, {
          sensorId: sensor.sensorId
        }));
      });
    }
  }
}

User.prototype.__proto__ = events.EventEmitter.prototype;

module.exports.get = function(userUid) {
  if (!users[userUid]) {
    users[userUid] = new User(userUid);
  }
  return users[userUid];
};
