var dataConnector = require('./data-connector.js');
var REDIS_URL = '127.0.0.1';
var REDIS_PORT = 6379;
var redis = require('redis');
var redisClient = redis.createClient(REDIS_PORT, REDIS_URL);
var q = require('q');

//EMAILS!!!!
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('oGy0jZB6VLx7JhhlSmVaSA');
var REPLY_TO_EMAIL_ADDRESS = 'sensycam@mathieugardere.com';




function checkDebounce(notificationSetting) {
    var deferred = q.defer();

    redisClient.get('debounce_' + notificationSetting.uns_uid, function(err, reply) {
        if (err) {
            throw err;
        } else {
            if (reply) {
                //debounce active... do nothing for this notification
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }
        }
    });

    return deferred.promise;
}

function notify(sensorId, sampleId) {
    dataConnector.getAll('sensor', [{
        field: 'sensor_id',
        value: sensorId
    }]).
    then(function(sensors) {
        var sensor = sensors[0];

        return dataConnector.getAll('user_notification_setting', [{
            field: 'user_uid',
            value: sensor.user_uid
        }]);
    }).
    then(function(userNotificationSettings) {
        for (var i = 0; i < userNotificationSettings.length; i += 1) {
            processNotification(userNotificationSettings[i], sampleId);
        }
    });
}

function processNotification(notificationSetting, sampleId) {
    //uns_debounce_period_seconds

    if (notificationSetting.uns_debounce_period_seconds > 0) {
        checkDebounce(notificationSetting).
        then(function(isDebounceActive) {
            if (!isDebounceActive) {
                redisClient.setex('debounce_' + notificationSetting.uns_uid, notificationSetting.uns_debounce_period_seconds, 'true');
                sendNotification(notificationSetting, sampleId);
            }
        });
    } else {
        sendNotification(notificationSetting, sampleId);
    }
}

function sendNotification(notificationSetting, sampleId) {
    var details = null;
    try {
        details = JSON.parse(notificationSetting.uns_details)
    } catch (e) {
        console.log('error trying to parse usn details for usn #' = notificationSetting.usn_uid);
    }
    sender['send_' + notificationSetting.uns_type](details, sampleId);
}

function sendEmail(details, sampleId) {
    //EMAIL
    mandrill_client.messages.sendTemplate({
        "message": {
            "to": [{
                "email": details.to,
                "name": details.name,
                "type": "to"
            }],
            "headers": {
                "Reply-To": REPLY_TO_EMAIL_ADDRESS
            },
            "global_merge_vars": [{
                name: 'sampleid',
                value: sampleId
            }]
        },
        "template_name": 'new-notification',
        "template_content": [],
        "async": true
    }, function(result) {
        console.log('sent notif email to ' + details.to);
    }, function(e) {
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    });
}

function sendApn(details, sampleId) {
    //Apple Push Notification
}

function sendGcm(details, sampleId) {
    //Google Cloud Messaging
}

function sendText(details, sampleId) {
    //SMS / Text Messages
}


var sender = {
    send_email: sendEmail,
    send_gcm: sendGcm,
    send_email: sendEmail,
    send_sms: sendText,
}

module.exports.notify = notify;
