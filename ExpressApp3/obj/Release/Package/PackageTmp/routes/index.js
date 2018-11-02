'use strict';
var express = require('express');
var esRequest = require('request');
var router = express.Router();
var dateFormat = require('dateFormat');
const esPort = 9243;
const esUrl = "https://elastic:phwEbiaOAKvULVw8rsfq7VCD@e4ba45ba778443198d78e0d109ed6131.us-west1.gcp.cloud.es.io";
const translationType = "translations"
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET home page. */
router.get('/', function (req, res) {

    //Query elasticsearch for some [random] translations to display to the user
    esRequest({
        url: `${esUrl}:${esPort}/translations/_search`,
        method: 'GET',
        json: { "from": 0, "size": 25, "query": { "match_all": {} } }
    }, function (request, response) {

        let number_Of_Hits = response.body.hits.hits.length;
        let random_Number = Math.floor((Math.random() * (number_Of_Hits - 1)));
        let number_Of_Definitions_To_Display = 3;
        let previous_Random_Numbers = [];
        let question = [];
        let sourceLanguage = [];
        let destinationLanguage = [];
        let submitter = [];
        let translation = [];
        let exampleSentence = [];
        let upvotes = [];
        let downvotes = [];
        let audioWord = [];
        let audioSentence = [];
        let translatorNotes = [];
        let tags = [];
        let author = [];

        try {
            for (let count = 0; count < number_Of_Definitions_To_Display; count++) {
                //Choose another random translation to display if current one has already been chosen
                while (previous_Random_Numbers.includes(random_Number)) {
                    write_Log('Trying again, duplicate found: ' + random_Number)
                    random_Number = Math.floor((Math.random() * (number_Of_Hits - 1)));
                }

                //Assign translation properties to variables which will be used to render
                question[count] = response.body.hits.hits[random_Number]._source.question;
                sourceLanguage[count] = response.body.hits.hits[random_Number]._source.sourceLanguage;
                destinationLanguage[count] = response.body.hits.hits[random_Number]._source.destinationLanguage;
                submitter[count] = response.body.hits.hits[random_Number]._source.submitter;
                translation[count] = response.body.hits.hits[random_Number]._source.answers[0].definition.translation;
                exampleSentence[count] = response.body.hits.hits[random_Number]._source.answers[0].definition.exampleSentence;
                upvotes[count] = response.body.hits.hits[random_Number]._source.answers[0].definition.upvotes;
                downvotes[count] = response.body.hits.hits[random_Number]._source.answers[0].definition.downvotes;
                audioWord[count] = response.body.hits.hits[random_Number]._source.answers[0].definition.audioWord;
                audioSentence[count] = response.body.hits.hits[random_Number]._source.answers[0].definition.audioSentence;
                translatorNotes[count] = response.body.hits.hits[random_Number]._source.answers[0].definition.translatorNotes;
                tags[count] = response.body.hits.hits[random_Number]._source.answers[0].definition.tags;
                author[count] = response.body.hits.hits[random_Number]._source.answers[0].definition.author;
                previous_Random_Numbers.push(random_Number);

                //Choose another random translation to display
                random_Number = Math.floor((Math.random() * (number_Of_Hits - 1)));
            }

            write_Log('rendering: ' + question);

            res.render('index', {
                questions: question,
                sourceLanguages: sourceLanguage,
                destinationLanguages: destinationLanguage,
                submitters: submitter,
                translation: translation,
                exampleSentence: exampleSentence,
                upvotes: upvotes,
                downvotes: downvotes,
                audioWord: audioWord,
                audioSentence: audioSentence,
                translatorNotes: translatorNotes,
                tags: tags,
                author: author,
                matches: ["cat"]
            });
        }
        catch (error) {
            write_Log(error);
            res.end(error.toString());
        }
    });
});












/*'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. 
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
*/