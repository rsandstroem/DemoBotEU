/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-luis
-----------------------------------------------------------------------------*/
"use strict";

// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
//var path = require('path');

// Connection to a remote NoSQL database Azure Table Storage
var tableName = process.env['TableName'];
var storageName = process.env['TableStorageName']; // Obtain from Azure Portal
var storageKey = process.env['AzureTableKey']; // Obtain from Azure Portal
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, storageName, storageKey);
var tableStorage = new botbuilder_azure.AzureBotStorage({
    gzipData: false
}, azureTableClient);

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword']
    //    stateEndpoint: process.env['BotStateEndpoint'],
    //    openIdMetadata: process.env['BotOpenIdMetadata']
});

//var bot = new builder.UniversalBot(connector).set('storage', new builder.MemoryBotStorage());
var bot = new builder.UniversalBot(connector)
    .set('storage', tableStorage)
    .set('persistUserData', true);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westeurope.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey + '&staging=true&verbose=true&timezoneOffset=0';

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({
    recognizers: [recognizer]
});
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/


// Dialogs
var di_askGenericYesNo = require('./dialogs/askGenericYesNo');
var di_askName = require('./dialogs/askName');
var di_tellJoke = require('./dialogs/tellJoke');
var di_quoteScooter = require('./dialogs/quoteScooter');
var di_qna = require('./dialogs/qna');

bot.dialog('/askGenericYesNo', di_askGenericYesNo.Dialog);
bot.dialog('/askName', di_askName.Dialog);
bot.dialog('/tellJoke', di_tellJoke.Dialog);
bot.dialog('/quoteScooter', di_quoteScooter.Dialog);
bot.dialog('/qna', di_qna.Dialog);

// Starting a new conversation will trigger this message
bot.on('conversationUpdate',
    function (message) {
        if (message.membersAdded) {
            message.membersAdded.forEach(function (identity) {
                if (identity.id == message.address.bot.id) {
                    var reply = new builder.Message()
                        .address(message.address)
                        .text("Welcome to the DemoBot!");
                    bot.send(reply);
                }
            });
        }
    }
);


intents.onBegin(function (session) {
    if (!session.privateConversationData.existingSession) {
        session.privateConversationData.existingSession = true;
        //var greetingText = 'Welcome to the DemoBot!';
        //session.send(greetingText);
        session.beginDialog('/askName');
    } else {
        session.send("What else would you like to discuss?");
    }
});

// for debug purposes
intents.matches(/^version/i, function (session) {
    session.send('Bot version 0.1');
});

intents.matches(/^user/i, function (session) {
    session.send('You are %s.', session.privateConversationData.username);
});

intents.matches(/^joke/i, function (session) {
    session.beginDialog('/tellJoke');
});


intents.matches(/^scooter/i, function (session) {
    session.beginDialog('/quoteScooter');
});


// LUIS intent capture
intents.matches('Joke', function (session) {
    console.log("Received a joke intent");
    session.beginDialog('/tellJoke');
});

intents.matches('Scooter', function (session) {
    session.beginDialog('/quoteScooter');
});

intents.matches('QnA', function (session, args) {
    console.log("Received a qna intent");
    session.beginDialog('/qna', {
        entities: args.entities
    });
});

// default back to root dialog
intents.onDefault([(session) => {
    console.log("Default dialog");
    session.send("This is a demonstration bot with limited functionality. To try it out, you can try to \n - Ask 'What is Deloitte?' (or EY, PwC, KPMG...)\n - Tell me a joke\n - Quote Scooter");
    session.beginDialog('/');
}]);

bot.dialog('/', intents);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpoint at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = {
        default: connector.listen()
    }
}