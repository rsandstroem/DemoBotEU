var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

module.exports = {
    Label: 'Ask name',
    Dialog: [
        function (session, results) {
            builder.Prompts.text(session, 'What is your name?');
        },
        function (session, results) {
            if (results.response) {
                session.userData.username = results.response;
                session.endDialog("Hello %s, I am pleased to meet you.", session.userData.username);
            }
        }
    ]
}