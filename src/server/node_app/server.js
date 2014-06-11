var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var mkdirp = require('mkdirp');
var moment = require('moment');
var app = express();
var exec = require('child_process').exec;
var bcrypt = require('bcrypt');
var _ = require('underscore');

var guid = require('./guid.js').guid;
var dataConnector = require('./data-connector.js');
var sessionManagement = require('./session-management.js');

var PORT = 21177;
var FILE_STORAGE_BASE = __dirname + '/file_storage/';

var success_status = 'SUCCESS';
var failure_status = 'FAILURE';

var samplesListeners = [];


app.use(express.static(__dirname + '/../web_app/app/'));

app.use(bodyParser());

app.post('/sensor', function(req, response) {
    var sensor = {
        sensor_id: req.body.sensor_id || guid(),
        sensor_name: req.body.name,
        sensor_coordinates: req.body.latitude + ' / ' + req.body.longitude,
        sensor_accuracy: req.body.accuracy
    };
    dataConnector.save('sensor', sensor).
    then(function() {
        response.json({
            status: success_status,
            sensor: sensor
        });
    }, function(error) {
        response.json({
            status: failure_status,
            error: error
        });
    });
});


function getBucketForSensor(sensorId, startDate) {
    return sensorId + '/' + moment(startDate).format("YYYYMMDD") + '/' + moment(startDate).format("HH");
}


app.get('/auth/challenge', function(req, res) {
    res.json({
        challenge_part1: '' + _.now(),
        challenge_part2: guid(),
        salt: bcrypt.genSaltSync(10)
    });
});

function checkSession(token, res, callback) {
    sessionManagement.getSessionToken(token).then(callback,
        function() {
            res.json({
                status: failure_status,
                error: 'SESSION_EXPIRED'
            });
        });
}

function getSessionToken(username) {
    var token = guid();
    sessionManagement.setSessionToken(token, username)
    return token;
}

app.get('/ping/:token', function(req, res) {
    checkSession(req.params.token, res, function() {
        res.json({
            status: success_status,
            message: 'PONG'
        });
    });
});

app.post('/auth/register', function(req, res) {
    dataConnector.getAll('user', [{
        field: 'username',
        value: req.body.username
    }]).
    then(function(users) {
        if (users.length === 0) {
            dataConnector.save('user', {
                username: req.body.username,
                password: req.body.sha1password
            }).then(function() {
                res.json({
                    status: success_status,
                    message: 'user created'
                });
            }, function() {
                res.json({
                    status: failure_status,
                    error: error
                });
            });
        } else {
            res.json({
                status: failure_status,
                error: 'Username in use'
            });
        }
    })

});


//authentication method expect the client to send 
// a USERNAME in clear
// a PASSWORD SHA1ed and encrypted with random salt value AND changing keys (challenges) expiring after 5 seconds, for 2 reasons
//      1. passwords are not persisted in clear in the DB
//      2. the changing keys ensure that a middle man attack cannot let the attackers reuse the keys
app.post('/auth', function(req, res) {
    var MAX_CHALLENGE_AGE_IN_SECONDS = 5;

    var challenge_part1 = req.body.challenge_part1;
    var challenge_part2 = req.body.challenge_part2;
    var salt = req.body.salt;

    console.log('challenge_part1 age ' + Math.abs(parseInt(challenge_part1, 10) - _.now()));
    if (Math.abs(parseInt(challenge_part1, 10) - _.now()) > MAX_CHALLENGE_AGE_IN_SECONDS * 1000) {
        res.json({
            status: failure_status,
            error: 'Challenge is too old (more than ' + MAX_CHALLENGE_AGE_IN_SECONDS + ' seconds)'
        });
    } else {
        var username = req.body.username;
        dataConnector.getAll('user', [{
            field: 'username',
            value: username
        }]).
        then(function(users) {
            if (users.length === 0) {
                console.log('no user \'' + username + '\' found');
                res.json({
                    status: failure_status,
                    error: 'Incorrect username or password'
                });
            } else {
                var hash = bcrypt.hashSync(users[0].password + challenge_part1 + challenge_part2, salt);
                if (hash === req.body.password) {
                    res.json({
                        status: success_status,
                        token: getSessionToken(username)
                    });
                } else {
                    res.json({
                        status: failure_status,
                        error: 'Incorrect password'
                    });
                }
            }
        })
    }
});

app.get('/sensors/:sessionToken', function(req, res) {
    checkSession(req.params.sessionToken, res, function() {
        dataConnector.getAll('sensor').
        then(function(sensors) {
            res.json({
                status: success_status,
                sensors: sensors
            });
        });
    });
});

app.get('/samples/:sessionToken/:sensorId', function(req, res) {
    checkSession(req.params.sessionToken, res, function() {
        dataConnector.getAll('sample', [{
            field: 'sensor_id',
            value: req.params.sensorId
        }]).
        then(function(samples) {
            res.json(samples);
        })
    });
});

app.get('/samples/:sessionToken/:sensorId/:dtFrom/:dtTo', function(req, res) {
    checkSession(req.params.sessionToken, res, function() {
        dataConnector.getAll('sample', [{
            field: 'sensor_id',
            value: req.params.sensorId
        }, {
            field: 'sample_start_date',
            comparator: '>=',
            value: new Date(parseInt(req.params.dtFrom, 10))
        }, {
            field: 'sample_start_date',
            comparator: '<=',
            value: new Date(parseInt(req.params.dtTo, 10))
        }]).
        then(function(samples) {
            res.json(samples);
        })
    });
});

app.get('/sample/:sessionToken/:sampleId', function(req, res) {
    checkSession(req.params.sessionToken, res, function() {
        dataConnector.getAll('sample', [{
            field: 'sampleUid',
            value: req.params.sampleId
        }]).
        then(function(rows) {
            var sample = rows[0];
            var filePath = sample.path;
            fs.stat(filePath, function(error, stat) {
                if (error) {
                    res.json({
                        status: failure_status,
                        error: error
                    });
                } else {
                    res.writeHead(200, {
                        'Content-Type': (sample.sample_type)==='audio'? 'audio/mp3':'image/jpeg',
                        'Content-Length': stat.size
                    });

                    var readStream = fs.createReadStream(filePath);
                    readStream.pipe(res);
                }
            });
        });
    });
});

function convertFile(mp4, mp3) {
    exec('ffmpeg -i ' + mp4 + ' -acodec libmp3lame -b:a 24k  -f mp3 ' + mp3);
}



function acceptSoundSample(sensorId, token, quality, soundLevels, req, res) {
    var sensorId = sensorId;
    var token = token;
    var soundLevels = soundLevels;

    var maxSoundLevel = soundLevels.split('_')[0];
    var avgSoundLevel = soundLevels.split('_')[1];
    var startDate = new Date(parseInt(token.split('_')[0], 10));
    var duration = parseInt(token.split('_')[1], 10);

    var bucket = getBucketForSensor(sensorId, startDate);
    var path = FILE_STORAGE_BASE + bucket;


    mkdirp(path, function(err) {
        if (err) {
            throw err;
        }

        var filename = FILE_STORAGE_BASE + bucket + '/' + token + '.mp3';
        var mp4Filename = filename + '.m4a';
        var writeStream = fs.createWriteStream(mp4Filename);
        req.pipe(writeStream);

        req.on('end', function() {
            convertFile(mp4Filename, filename);

            var sample = {
                sensor_id: sensorId,
                path: filename,
                sampleUid: guid(),
                sample_quality: quality,
                sample_max_sound_level: maxSoundLevel,
                sample_average_sound_level: avgSoundLevel,
                sample_start_date: startDate,
                sample_duration: duration,
                sample_type: 'audio' //a-ew-dee-oh
            };

            dataConnector.save('sample', sample).then(function() {
                broadcast('sample', sample);
                res.json({
                    status: success_status
                });
            }, function() {
                res.json({
                    status: failure_status,
                    error: error
                });
            });
        });
    });
}

//TODO: deprecate this API (sample type should be specified)
app.post('/sampleData/:sensorId/:token/:quality/:soundLevels', function(req, res) {
    acceptSoundSample(req.params.sensorId, req.params.token, req.params.quality, req.params.soundLevels, req, res);
});




app.post('/samplePicture/:sensorId/:token', function(req, res) {
    var token = req.params.token;
    var sensorId = req.params.sensorId;

    var startDate = new Date(parseInt(token, 10));
    var bucket = getBucketForSensor(sensorId, startDate);

    var path = FILE_STORAGE_BASE + bucket;

    mkdirp(path, function(err) {
        if (err) {
            throw err;
        }

        var filename = FILE_STORAGE_BASE + bucket + '/' + token + '.png';
        var writeStream = fs.createWriteStream(filename);
        req.pipe(writeStream);

        req.on('end', function() {
            res.json({
                status: 'SUCCESS',
                message: 'Sample correctly uploaded.'
            });

            var sample = {
                sensor_id: sensorId,
                path: filename,
                sampleUid: guid(),
                sample_start_date: startDate,
                sample_type: 'picture' //a-ew-dee-oh
            };

            dataConnector.save('sample', sample).then(function() {
                broadcast('sample', sample);
                res.json({
                    status: success_status
                });
            }, function() {
                res.json({
                    status: failure_status,
                    error: error
                });
            });
        });
    });

});





var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

function broadcast(event, value) {
    for (var i = 0; i < samplesListeners.length; i += 1) {
        samplesListeners[i].emit(event, value);
    }
}

function addListener(listener) {
    if (samplesListeners.indexOf(listener) === -1) {
        samplesListeners.push(listener);
    }
}

function removeListener(listener) {
    var index = samplesListeners.indexOf(listener);
    if (index !== -1) {
        samplesListeners.splice(index, 1);
    }
}


//TODO: session token check
io.sockets.on('connection', function(socket) {
    addListener(socket);

    socket.on('disconnect', function() {
        removeListener(socket);
    });

});


server.listen(PORT, function() {
    console.log('Listening on port %d', server.address().port);
});
