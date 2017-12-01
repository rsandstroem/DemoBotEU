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

bot.dialog('/askGenericYesNo', di_askGenericYesNo.Dialog);
bot.dialog('/askName', di_askName.Dialog);
bot.dialog('/tellJoke', di_tellJoke.Dialog);
bot.dialog('/quoteScooter', di_quoteScooter.Dialog);

// Starting a new conversation will trigger this message
// updating following the guidance from MS
// bot.on('conversationUpdate',
//     function (message) {

//         // is this system message that the bot joined?
//         // we expect the bot to show up first, and this should trigger the message
//         if (message.membersAdded[0].id != message.address.bot.id) {
//             // if it's not the bot, ignore the whole 'conversationUpdate'          
//             return; // !!! this still does not work on the higly async web chat, and the code after return is executed nonetheless !!!
//         };

//         var greetingText = 'Welcome to the DemoBot!';
//         var reply = new builder.Message()
//             .textFormat(builder.TextFormat.xml)
//             .address(message.address)
//             .text(greetingText);
//         bot.send(reply);
//         bot.beginDialog(message.address, '/');
//     }
// );


intents.onBegin(function (session) {
    if (!session.privateConversationData.existingSession) {
        session.privateConversationData.existingSession = true;
        var greetingText = 'Welcome to the DemoBot!';
        session.send(greetingText);
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
    session.send('You are %s.', session.userData.username);
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

// default back to root dialog
intents.onDefault([(session) => {
    console.log("Default dialog");
    session.send("Here is some helpful message... eventually");
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