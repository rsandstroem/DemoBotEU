var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

module.exports = {
    Label: 'Ask name',
    Dialog: [
        function (session, results) {
            builder.Prompts.text(session, 'What is your name?');
        },
        function (session, results, next) {
            if (results.response) {
                session.userData.username = results.response;
                session.save();
                console.log(session.userData.username);
                next();                
            }
        },
        function (session) {
            session.endDialog("Hello %s, I am pleased to meet you.", session.userData.username);
        }
    ]
}