var dataConnector = require('./data-connector.js');

//Sending EMAILS
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('oGy0jZB6VLx7JhhlSmVaSA');

var REPLY_TO_EMAIL_ADDRESS = 'mathieu@lesbandits.com';

function notify(sensorId, sampleId) {
    //TODO get notifications for sensor user
    dataConnector.getAll('sensor', [{
        field: 'sensor_id',
        value: sensor_id
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
            sendNotification(userNotificationSettings[i], sampleId);
        }
    });
}

function sendNotification(notificationSetting, sampleId) {
    var details = null;
    try {
        details = JSON.parse(notifications.uns_details)
    } catch (e) {
        console.log('error trying to parse usn details for usn #' = notificationSetting.usn_uid);
    }
    sender['send_' + notifications.uns_type](details, sampleId);
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
        },
        "template_name": 'new-notification',
        "template_content": [{
            'SAMPLEID': sampleId
        }],
        "async": async,
    }, function(result) {
        console.log(result);
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
