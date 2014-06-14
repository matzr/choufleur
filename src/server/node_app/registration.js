var guid = require('./guid.js').guid;
var REDIS_URL = '127.0.0.1';
var REDIS_PORT = 6379;
var redis = require('redis');
var redisClient = redis.createClient(REDIS_PORT, REDIS_URL);
var q = require('q');

var json_statuses = require('./json-values.js').statuses;
var dataConnector = require('./data-connector.js');
var MAX_VALIDITY_REGISTRATION_TOKEN = 600; // 10 minutes
var onTokenUsed = null;
var checkSession;

function requestSensorToken(req, res) {
  checkSession(req.params.token, res, function(user) {
    //TODO: check the limit of sensors for this user/token
    var token = parseInt(Math.random() * 1000000, 10);
    redisClient.setex('registration_token_' + token, MAX_VALIDITY_REGISTRATION_TOKEN, JSON.stringify(user));
    res.json({
      status: json_statuses.success,
      sensorRegistrationToken: token
    });
  });
}

function checkRegistrationToken(token) {
  var deferred = q.defer();

  redisClient.get('registration_token_' + token, function(err, reply) {
    if (err) {
      throw err;
    }
    if (reply) {
      deferred.resolve(JSON.parse(reply));
    } else {
      deferred.reject();
    }
  });

  return deferred.promise;
}


function registerSensor(req, response) {
  var sensor = {
    sensor_id: guid(),
    sensor_name: req.body.name
  };

  checkRegistrationToken(req.params.registration_token).
  then(function(user) {
    //token ok
    redisClient.del(req.params.registration_token);
    //TODO: check the limit of sensors for this user

    sensor.user_uid = user.user_uid;
    dataConnector.save('sensor', sensor).
    then(function() {
      if (onTokenUsed) {
        response.json({
          status: json_statuses.success,
          sensor: sensor
        });
        onTokenUsed(req.params.registration_token);
      }
    });
  }, function() {
    //token nok
    response.json({
      status: json_statuses.failure,
      error: 'Token invalid or expired'
    })

  });
};


function setup(app, checkSessionMethod) {
  checkSession = checkSessionMethod;

  //api to request registration token
  app.get('/request_sensor_token/:token', requestSensorToken);

  //api to register a device using a registration token
  app.post('/register_sensor_with_token/:registration_token', registerSensor);
}

function setOnTokenUsed(callback) {
  onTokenUsed = callback;
}

module.exports.setup = setup;
module.exports.setOnTokenUsed = setOnTokenUsed;
