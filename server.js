const express = require('express');
const FCM = require('fcm-node');
const path = require('path');
const bodyParser = require('body-parser');

// Setting up the express app
const app = express();

// FCM Server Key
const serverKey = '<----- FCM Server Key ----->';

const fcm = new FCM(serverKey);

// Parsing the POST data
app.use(bodyParser.json());

// Serving the static files in the dist directory
app.use(express.static(__dirname + '/dist'));

// Setting up a middleware to always serve index.html
app.use('/', (err, req, res, next) => {
    console.log('Inside default route');
    res.sendFile(path.join(__dirname, 'dist/index.html'));
    next();
});

// Setting up the POST route for sending notification
app.post('/send-notification', (req, res) => {
    console.log(req.body);

    const topic = req.body.topic.trim();
    const title = req.body.title.trim();
    const message = req.body.message.trim();
    const pictureURL = req.body.imageURL.trim();

    const notification = {
        to: `/topics/${topic}`, // FCM doesn't allow sending to all users of this app(except Firebase console), rather users are required to be subscribed to a notification 'topic'
        priority: 'high',
        data: {
            title: title,
            message: message,
            style: 'picture',
            picture: pictureURL,
            ledColor: [0, 0, 255, 0], // Green LED Notification Light
            vibrationPattern: [2000, 1000, 500, 500], // Device should wait for 2 seconds, vibrate for 1 second then be silent for 500 ms then vibrate for 500 ms
            priority: 2 // Maximum priority
        }
    };

    fcm.send(notification, function(err, response){
        if (err) {
            console.log("Notification not sent", err);
            res.status(500).json({success:false});
        } else {
            console.log("Successfully sent with response: ", response);
            res.status(200).json({success:true});
        }
    });

});

// Catch all other routes and return the index file
app.get('/*', (req, res) => {
    console.log("Inside wildcard route");
    console.log(req.body);
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Start the app by listening on the default
// Heroku port
app.listen(process.env.PORT || 8000);


/* Notes on Push Notifications
==============================================================================

On Android if you want your on('notification') event handler to be called when your app is in the background it is relatively simple.

First the JSON you send from GCM will need to include "content-available": "1". This will tell the push plugin to call your on('notification') event handler no matter what other data is in the push notification.

{
    "registration_ids": ["my device id"],
    "data": {
    	"title": "Test Push",
    	"message": "Push number 1",
    	"info": "super secret info",
    	"content-available": "1"
    }
}

or if you want the payload to be delivered directly to your app without anything showing up in the notification center omit the tite/message from the payload like so:

{
    "registration_ids": ["my device id"],
    "data": {
    	"info": "super secret info",
    	"content-available": "1"
    }
}

=====================================================================
Use of content-available: true

The GCM docs will tell you to send a data payload of:

{
    "registration_ids": ["my device id"],
    "content_available": true,
    "data": {
        "title": "Test Push",
        "message": "Push number 1",
        "info": "super secret info",
    }
}
Where the content-available property is part of the main payload object. Setting the property in this part of the payload will result in the PushPlugin not getting the data correctly. Setting content-available: true will cause the Android OS to handle the push payload for you and not pass the data to the PushPlugin.

Instead move content-available: true into the data object of the payload and set it to 1 as per the example below:

{
    "registration_ids": ["my device id"],
    "data": {
        "title": "Test Push",
        "message": "Push number 1",
        "info": "super secret info",
        "content-available": "1"
    }
}

==================================================================
If you add force-start: 1 to the data payload the application will be restarted in background even if it was force closed.

{
    "registration_ids": ["my device id"],
    "data": {
    	"title": "Force Start",
    	"message": "This notification should restart the app",
    	"force-start": 1
    }
}

===========================================================
Visibility of Notifications

You can set a visibility parameter for your notifications. Just add a visibility field in your notification. -1: secret, 0: private (default), 1: public. Secret shows only the most minimal information, excluding even the notification's icon. Private shows basic information about the existence of this notification, including its icon and the name of the app that posted it. The rest of the notification's details are not displayed. Public Shows the notification's full content.

{
    "registration_ids": ["my device id"],
    "data": {
    	"title": "This is a maximum public Notification",
    	"message": "This notification should appear in front of all others",
    	"visibility": 1
    }
}

*/