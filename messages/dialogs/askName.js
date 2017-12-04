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
                session.privateConversationData.username = results.response;
                session.save();
                //session.endDialog("Hello %s, I am pleased to meet you.", session.privateConversationData.username);
                session.send("Hello %s, I am pleased to meet you.", session.privateConversationData.username);
		session.replaceDialog('/');
            }
        }
    ]
}
