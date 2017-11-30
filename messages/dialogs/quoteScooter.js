var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var request = require('request');


module.exports = {
    Label: 'Quote Scooter',
    Dialog: [
        function (session, args) {
            session.send("Quoting the guru:");
            request('https://howmuchisthe.fish/json/random', function (error, response, body) {
                var info = JSON.parse(body);
                console.log(info);
                session.send(info.quote.text);
		username = session.privateConversationData.username;
                const message = "How about another one " + username+ "?";
                builder.Prompts.confirm(session, message);
            });
        },
        function (session, args, results) {
            if (args.response) {
                session.replaceDialog('/quoteScooter');
            }
            else {
                session.endDialog("OK, enough Scooter for now.");
            }
        }
    ]
}
