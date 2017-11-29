var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var request = require('request');


module.exports = {
    Label: 'Quote Scooter',
    Dialog: [
        function (session) {
            session.send("Quoting the guru:");
            request('https://howmuchisthe.fish/json/random', function (error, response, body) {
                var info = JSON.parse(body);
                console.log(info);
                session.send(info.quote.text);
                session.endDialog();
            });
        }
    ]
}