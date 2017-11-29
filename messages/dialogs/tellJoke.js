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
                session.endDialog();
            });
        }
    ]
}
