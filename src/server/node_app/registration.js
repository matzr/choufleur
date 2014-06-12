var guid = require('./guid.js').guid;
var REDIS_URL = '127.0.0.1';
var REDIS_PORT = 6379;
var redis = require('redis');
var redisClient = redis.createClient(REDIS_PORT, REDIS_URL);
var q = require('q');

var json_statuses = require('./json-values.js').statuses;
var dataConnector = require('./data-connector.js');
var MAX_VALIDITY_REGISTRATION_TOKEN = 300; // 5 minutes

var checkSession;

function requestSensorToken(req, res) {
    checkSession(req.params.token, res, function(username) {
        //TODO: check the limit of sensors for this user/token
        var token = parseInt(Math.random() * 1000000, 10);
        redisClient.setex('registration_token_' + token, MAX_VALIDITY_REGISTRATION_TOKEN, username);
        res.json({
            status: json_statuses.success,
            sensorRegistrationToken: token
        });
    });
}

function addSensor(sensor, res) {
    dataConnector.save('sensor', sensor).
    then(function() {
        res.json({
            status: json_statuses.success,
            sensor: sensor
        });
    }, function(error) {
        res.json({
            status: json_statuses.failure,
            error: error
        });
    });
}

function checkRegistrationToken(token) {
	var deferred = q.defer();

	redisClient.get('registration_token_' + token, function (err, reply) {
		if (err) {
			throw err;
		}
		if (reply) {
			deferred.resolve(reply);
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
    then(function(username) {
        //token ok

        //TODO: check the limit of sensors for this user

        dataConnector.getAll('user', [{
            'field': 'username',
            'value': username
        }]).then(function (users) {
            sensor.user_uid = users[0].user_uid;
            addSensor(sensor, response);
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


module.exports.setup = setup;
