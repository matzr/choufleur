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
        if (err) {
            console.log(err);
            deferred.reject(err);
        } else {
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

                connection.release();
            });
        }
    });


    return deferred.promise;
}

function getSqlWhereClause(conditions) {
    var whereClause = '';
    var params = [];

    if (conditions) {
        for (var i = 0; i < conditions.length; i += 1) {
            anyCondition = true;
            var condition = conditions[i];

            whereClause += (whereClause === '') ? ' WHERE ' : ' AND ';
            var fieldName = condition.field;
            var comparator = condition.comparator || '=';
            var value = condition.value;
            
            whereClause += fieldName + comparator + ' ?';
            params.push(value);
        }
    }

    return {
        sql: whereClause,
        params: params
    };
}


function getAll(objectName, conditions) {
    var deferred = q.defer();

    pool.getConnection(function(err, connection) {

        if (err) {
            console.log(err);
            deferred.reject(err);
        } else {
            var whereClause = getSqlWhereClause(conditions);
            connection.query('SELECT * from ' + MYSQL_DB + '.' + objectName + whereClause.sql, whereClause.params, function(err, rows) {
                if (err) {
                    console.log(err);
                    deferred.reject(err);
                } else {
                    deferred.resolve(rows);
                }
                connection.release();
            });
        }

    });
    return deferred.promise;
}

module.exports.save = save;
module.exports.getAll = getAll;
