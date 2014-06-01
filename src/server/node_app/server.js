var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var mkdirp = require('mkdirp');
var moment = require('moment');
var app = express();
var exec = require('child_process').exec;

var guid = require('./guid.js').guid;
var dataConnector = require('./data-connector.js');


var PORT = 21177;
var FILE_STORAGE_BASE = __dirname + '/file_storage/';

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
            status: 'SUCCESS',
            sensor: sensor
        });
    }, function(error) {
        response.json({
            status: 'FAILURE',
            error: error
        });
    });
});


function getBucketForSensor(sensorId, startDate) {
    return sensorId + '/' + moment(startDate).format("YYYYMMDD") + '/' + moment(startDate).format("HH");
}


app.get('/sensors', function(req, res) {
    dataConnector.getAll('sensor').
    then(function(sensors) {
        res.json(sensors);
    })
});

app.get('/samples/:sensorId', function(req, res) {
    dataConnector.getAll('sample', [{
        field: 'sensor_id',
        value: req.params.sensorId
    }]).
    then(function(samples) {
        res.json(samples);
    })
});

app.get('/samples/:sensorId/:dtFrom/:dtTo', function(req, res) {
    dataConnector.getAll('sample', [{
            field: 'sensor_id',
            value: req.params.sensorId
        },
        {
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
    
app.get('/sample/:sampleId', function(req, res) {
    dataConnector.getAll('sample', [{
        field: 'sampleUid',
        value: req.params.sampleId
    }]).
    then(function(rows) {
        var filePath = rows[0].path;
        fs.stat(filePath, function(error, stat) {
            if (error) {
                res.json({
                    status: 'FAILURE',
                    error: error
                });
            } else {
                res.writeHead(200, {
                    'Content-Type': 'audio/mp3',
                    'Content-Length': stat.size
                });

                var readStream = fs.createReadStream(filePath);
                readStream.pipe(res);
            }
        });
    });
});

app.post('/sampleData/:sensorId/:token/:quality/:soundLevels', function(req, res) {
    var sensorId = req.params.sensorId;
    var token = req.params.token;
    var soundLevels = req.params.soundLevels;

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
        var mp4Filename = filename + '.mp4';
        req.pipe(fs.createWriteStream(mp4Filename));

        req.on('end', function() {
            // new ffmpeg({
            //     source: mp4Filename
            // })
            //     .toFormat('mp3')
            //     .saveToFile(filename);
            exec('ffmpeg -i ' + mp4Filename + ' -acodec libmp3lame -b:a 24k  -f mp3 ' + filename);
        });

        var sample = {
            sensor_id: req.params.sensorId,
            path: filename,
            sampleUid: guid(),
            sample_quality: req.params.quality,
            sample_max_sound_level: maxSoundLevel,
            sample_average_sound_level: avgSoundLevel,
            sample_start_date: startDate,
            sample_duration: duration
        };

        dataConnector.save('sample', sample).then(function() {
            broadcast('sample', sample);
            res.json({
                status: 'SUCCESS'
            });
        }, function() {
            res.json({
                status: 'FAILURE',
                error: error
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


io.sockets.on('connection', function(socket) {
    addListener(socket);

    socket.on('disconnect', function() {
        removeListener(socket);
    });

});


server.listen(PORT, function() {
    console.log('Listening on port %d', server.address().port);
});
