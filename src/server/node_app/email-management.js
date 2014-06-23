var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('oGy0jZB6VLx7JhhlSmVaSA');
var REPLY_TO_EMAIL_ADDRESS = 'sensycam@mathieugardere.com';



function sendEmail(to, subject, messageContent) {
	    mandrill_client.messages.send({
        "message": {
        	"html": messageContent,
		    "from_email": REPLY_TO_EMAIL_ADDRESS,
		    "from_name": "The SensyCam Team",
		    "subject": subject,
            "to": [{
                "email": to,
                "type": "to"
            }],
            "headers": {
                "Reply-To": REPLY_TO_EMAIL_ADDRESS
            }
        },
        "async": true
    }, function(result) {
        console.log('sent email to ' + to);
    }, function(e) {
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    });
}


module.exports.sendEmail = sendEmail;