var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

module.exports = {
    Label: 'Ask Generic Yes No',
    Dialog: [
        function (session, args) {
            if (session.privateConversationData.questionsYesNo[session.privateConversationData.currentQuestionKey] !== '') {
                session.endDialog();
            } else {
                builder.Prompts.choice(session, args.prompt, "Yes|No", {
                    listStyle: 3,
                    retryPrompt: "I do not understand. Please answer 'yes' or 'no'."
                });
            }
        },
        function (session, results) {
            if (results.response) {
                // session.privateConversationData.questionsYesNo will have true or false
                session.privateConversationData.questionsYesNo[session.privateConversationData.currentQuestionKey] = results.response.entity == "Yes";
                session.endDialog();
            }
        }
    ]
}