var REDIS_URL = '127.0.0.1';
var REDIS_PORT = 6379;
var guid = require('./guid.js').guid;
var redis = require('redis'),
    redisClient = redis.createClient(REDIS_PORT, REDIS_URL);
var STANDARD_EXPIRY_IN_SECONDS = 120;
var q = require('q');

function setSessionToken(token, username) {
	redisClient.setex(token, STANDARD_EXPIRY_IN_SECONDS, username);
}

function pingSessionToken(token)  {
	redisClient.expire(token, STANDARD_EXPIRY_IN_SECONDS);
}

function getSessionToken(token) {
	var deferred = q.defer();
    redisClient.get(token, function(err, reply) {
	    if (err) {
	        deferred.reject(err);
	    } else {
	        if (reply) {
				pingSessionToken(token);
	        	deferred.resolve();
	        } else {
	        	deferred.reject();
	        }
	    }
	});

	return deferred.promise;
}

module.exports.getSessionToken = getSessionToken;
module.exports.setSessionToken = setSessionToken;
module.exports.pingSessionToken = pingSessionToken;
