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
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westeurope.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey + '&staging=true&verbose=true&timezoneOffset=0';

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
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
bot.on('conversationUpdate', 
function (message) {

    // is this system message that the bot joined?
    // we expect the bot to show up first, and this should trigger the message
    if (message.membersAdded[0].id != message.address.bot.id) {
        // if it's not the bot, ignore the whole 'conversationUpdate'          
        return; // !!! this still does not work on the higly async web chat, and the code after return is executed nonetheless !!!
    };

    var greetingText = 'Welcome to the DemoBot!';

    var reply = new builder.Message()
        .textFormat(builder.TextFormat.xml)
        .address(message.address)
        .text(greetingText);

    bot.send(reply);

    bot.beginDialog(message.address, '/');

});

/*
#### ##    ## #### ######## 
 ##  ###   ##  ##     ##    
 ##  ####  ##  ##     ##    
 ##  ## ## ##  ##     ##    
 ##  ##  ####  ##     ##    
 ##  ##   ###  ##     ##    
#### ##    ## ####    ##    
*/

intents.onBegin(function (session) {
    if (!session.privateConversationData.existingSession) {
        session.privateConversationData.existingSession = true;
        //session.privateConversationData.usr3dialogPresented = false;
        
        // new variables for simplified contact entry: 
        //session.privateConversationData.fullname = "";
        //session.privateConversationData.fullcontact = "";

        // usr3Questions are the USER'S ANSWERS (e.g. holding = true/false) to the questions in Auswirkungen dialog
        //session.privateConversationData.usr3Questions = {};
        
        // usr3Answers are the BOT'S ANSWERS corresponding to combinations of USER'S ANSWERS
        //session.privateConversationData.usr3Answers = {};

        // create variables that will hold user's answers true/false, set them to empty
        //Object.keys(usr3QuestionsDB).forEach(function (key) {
        //    session.privateConversationData.usr3Questions[key] = "";
        //});

        // create variables that will hold bot's detailed answers
        //Object.keys(usr3AnswersDB).forEach(function (key) {
        //    session.privateConversationData.usr3Answers[key] = {presented: false, active: false};
        //});

        session.beginDialog('/askName');
        
    } else {

        // !!!!!!!!!!!!!!!! here we need to start a general dialog (show me glossary or effects ????)
        console.log("End");
        session.send("What else would you like to know?");
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

// default back to root dialog
intents.onDefault([(session) => {    
    console.log("Default dialog");     
    session.beginDialog('/');
}]);

bot.dialog('/', intents);    

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

