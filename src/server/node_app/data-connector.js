var MYSQL_HOST = 'localhost';
var MYSQL_USERNAME = 'root';
var MYSQL_PASSWORD = '';
var MYSQL_DB = 'ChouFleur';

var VERBOSE = false;

var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 10,
  host: MYSQL_HOST,
  user: MYSQL_USERNAME,
  password: MYSQL_PASSWORD
});

var q = require('q');
var _ = require('underscore');

function save(a, b, c) {
	if (typeof c === 'undefined') {
		return save1(a, b);
	} else {
		return save2(a, b, c);
	}
}

function save1(objectName, object) {
	return save2(objectName, _.keys(object), _.values(object));
}

function save2(objectName, fields, values) {
  var deferred = q.defer();

  var fieldsParams = [];
  var valuesParams = [];
  var fieldValuesParams = [];

  for (var i = 0; i < fields.length; i += 1) {
    fieldsParams.push('??');
    valuesParams.push('?');
    fieldValuesParams.push('?? = ?');
  }

  pool.getConnection(function(err, connection) {
  	var query = 'INSERT INTO ' + MYSQL_DB + '.' + objectName + '(' + fieldsParams.join(',') + ') VALUES (' + valuesParams.join(',') + ') ON DUPLICATE KEY UPDATE ' + fieldValuesParams.join(',') + ';';
  	var queryParams = _.flatten([fields, values, _.flatten(_.zip(fields, values))]);

  	if (VERBOSE) {
  		console.log(query);
  		console.log(queryParams);
  	}

    connection.query(query, queryParams, function(err, rows, fields) {
      if (err) {
        console.log(err);
        deferred.reject(err);
      } else {
      	deferred.resolve();
      }
    });

    connection.release();
  });


  return deferred.promise;
}

module.exports.save = save;