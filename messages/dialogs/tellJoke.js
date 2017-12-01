var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var request = require('request');


module.exports = {
    Label: 'Tell joke',
    Dialog: [
        function (session) {
            console.log("Telling a joke");
            session.send("Hmm... how about this one:");
            request('https://api.chucknorris.io/jokes/random', function (error, response, body) {
                var info = JSON.parse(body);
                console.log(info);
                session.send(info.value);
                const message = "I have a better one. Do you want to hear it?";
                builder.Prompts.confirm(session, message);
            });
        },
        function (session, args, results) {
            if (args.response) {
                // Tell another one by restarting the dialog.
                session.replaceDialog('/tellJoke');
            } else {
                session.endDialog("You are right, " + session.userData.username + ", it was not that funny. Let's do something else.");
            }
        }
    ]
}