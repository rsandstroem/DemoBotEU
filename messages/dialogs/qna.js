var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var makeherocard = require("../functions/makeherocard");
var glossaryLookup = require("../functions/glossaryLookup");

// Dictionaries
var qnaDB = require('../dictionaries/glossary');

// Path to folder with images
const pathToImages = 'http://kpmgvirtualtaxadvisor.azurewebsites.net/images/';

module.exports = {
    Label: 'Question and answer dialog ',
    Dialog: [
    function (session, args, next) {
        // LUIS recognizes wording like 'was ist ****' and brings it back under the name of Topic
        // we can manage the topic recognizing logic on LUIS portal
        
        // Problem with LUIS: it recognizes EACH WORD AS SEPARATE TOPIC: if you type "neue steuerreform", it will find "neue" und "steuer"
        // so we need to merge all topics into one string 
        var topic = ""
        console.log(args)

        for(var topicKey in args.entities) {
            if(args.entities[topicKey].type = 'Topic') {
                topic += " " + args.entities[topicKey].entity;
            }
        }
        topic = topic.trim();

        // look up the word returned by LUIS in the glossary using our fuzzy lookup function
        var foundGlossaryArticle = glossaryLookup(topic, qnaDB);

        // if article not found, just end the dialog and return to parent
        if(!foundGlossaryArticle) {
            session.endDialog('Leider weiss ich nicht, was es meint. Bitte fragen Sie mir etwas über die Reform.');
            // force to return, because even tho i call endDialog() above, function execution continues down below, which is not desired
            session.replaceDialog('/');
            return;
        }

		// here we will store a list of HeroCards, one entry is a full HeroCard object with picture etc..
		var HeroCardArray = [];

		// loop through all contained cards and populate the HeroCardArray - if there are any cards attached to glossary article
		if(foundGlossaryArticle.object.cards && foundGlossaryArticle.object.cards.length > 0) {
			var cards = foundGlossaryArticle.object.cards;
			cards.forEach(
				function(card) {
                    var args = {};
                    args.thumbURL = pathToImages + card;
                    args.linkURL = pathToImages + card;
                    args.linkText = 'Bild vergrössern';
					HeroCardArray.push(makeherocard(session,args))
				});
            // create message
		    var msg = new builder.Message(session);                
            msg.textFormat(builder.TextFormat.xml)
			msg.attachmentLayout(builder.AttachmentLayout.carousel)
			msg.attachments(HeroCardArray);
		};

        session.send('Sie möchten wissen was %s meint? Moment bitte, ich suche ein Antwort für Sie.', foundGlossaryArticle.key);
        session.send(foundGlossaryArticle.object.longText);
        if(msg) {
            session.send(msg);
        };
    }, // first QnA question ends
    function (session, results) {
        session.endDialog("Danke für Ihre Fragen.")
    }
    ]
}
