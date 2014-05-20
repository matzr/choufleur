var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var mkdirp = require('mkdirp');
var app = express();

var guid = require('./guid.js').guid;
var dataConnector = require('./data-connector.js');


var PORT = 21177;
var FILE_STORAGE_BASE = '/Users/mathieu/file_storage/';


function getBucket() {
  return 'a';
}

app.use(bodyParser());

app.post('/sensor', function(req, response) {
	var sensor = {
		sensor_id: guid(),
		sensor_name: req.body.name
	};
	dataConnector.save('sensor', sensor).
	then(function () {
	  response.json({
	  	status: 'SUCCESS',
	  	sensor: sensor
	  });
  }, function (error) {
	  response.json({
	  	status: 'FAILURE',
	  	error: error
	  });
  });
});

app.post('/sample', function(req, response) {
  var bucket = getBucket();
  var token = guid();

  dataConnector.save('sample', {
    location_coordinates: req.body.location_coordinates,
    location_accuracy: req.body.location_coordinates,
    sensor_name: req.body.sensor_name,
    sensor_id: req.body.sensor_id,
    sample_start_date: req.body.sample_start_date,
    sample_duration: req.body.sample_duration,
    sample_quality: req.body.sample_quality,
    sample_average_sound_level: req.body.sample_average_sound_level,
    sample_max_sound_level: req.body.sample_max_sound_level,
    sample_min_sound_level: req.body.sample_min_sound_level,
    path: FILE_STORAGE_BASE + bucket,
    sampleUid: token
  }).then(function () {
	  response.json({
	  	status: 'SUCCESS'
	  });
  }, function () {
	  response.json({
	  	status: 'FAILURE',
	  	error: error
	  });
  });

});


app.post('/sampleData/:sensorId/:bucket/:token', function(req, res) {
  var sensorId = req.params.sensorId;
  var bucket = req.params.bucket;
  var token = req.params.token;
  var path = FILE_STORAGE_BASE + sensorId + '/' + bucket;

  mkdirp(path, function(err) {
    if (err) {
      throw err;
    }

    req.pipe(fs.createWriteStream(path + '/' + token + '.mp3'));
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });
    res.end('OK!');
  });
});

app.listen(PORT, function() {
  console.log('Listening on port %d', PORT);
});
