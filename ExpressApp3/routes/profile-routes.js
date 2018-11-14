const router       = require('express').Router();
const keys         = require('../config/keys');
const esRequest    = require('request');
const esPort       = 9243;
const esUrl        = keys.elasticSearch.url;
const EventEmitter = require('events');

// load profile page
router.get('/', function (req, res) {
    let elasticResponse = new EventEmitter();
    elasticResponse.upvotes = 0;
    elasticResponse.downvotes = 0;
    elasticResponse.numberOfTranslations = 0;
    elasticResponse.activeRequests = 0;
    let translations = [];

    esRequest({
        url: `${esUrl}:${esPort}/translations/_search`,
        method: 'GET',
        json: { "query": { "match": { "answers.definition.author": req.user.id } } }
    }, function (request, response) {
        //console.log(req.user.id);
        //console.log(response.body.hits.hits);
        

        for (let i = 0; i < response.body.hits.hits.length; i++) {
            console.log('=====================logging hits====================');
            console.log(response.body.hits.hits[i]._source.answers[0].definition);
            elasticResponse.upvotes += response.body.hits.hits[i]._source.answers[0].definition.upvotes;
            elasticResponse.downvotes += response.body.hits.hits[i]._source.answers[0].definition.downvotes;
        }

        esRequest({
            url: `${esUrl}:${esPort}/requests/_search`,
            method: 'GET',
            json: { "query": { "match": { "requester": req.user.id } } }
        }, function (request, response) {
            elasticResponse.activeRequests = response.body.hits.total;
            elasticResponse.emit('update');
        });

        elasticResponse.numberOfTranslations = response.body.hits.hits.length;
        elasticResponse.translations = response.body.hits.hits;
        
    });

    elasticResponse.on('update', function () {
        console.log('```````````````````````````````````````````````````````');
        console.log(elasticResponse.activeRequests);
        console.log('```````````````````````````````````````````````````````');
        res.render('profile', {
            user: req.user,
            upvotes: elasticResponse.upvotes,
            downvotes: elasticResponse.downvotes,
            numberOfTranslations: elasticResponse.numberOfTranslations,
            numberOfActiveRequests: elasticResponse.activeRequests
        });
    });

    /*
    res.render('profile', {
        user: req.user
    });
    */
});

router.get('/edittranslation', function (mreq, resp) {
    let elasticResponse = new EventEmitter();
    let esTranslationId = mreq.query.id;
    console.log(mreq.query.id);
    elasticResponse.upvotes = 0;
    elasticResponse.downvotes = 0;
    elasticResponse.numberOfTranslations = 0;
    elasticResponse.activeRequests = 0;

    esRequest({
        url: `${esUrl}:${esPort}/translations/x/${esTranslationId}`,
        method: 'GET'
    }, function (req, res) {
        let responseObject = JSON.parse(res.body);
        console.log('.............................................');
        console.log(responseObject._source.question);
        console.log('.............................................');
        console.log(`${esUrl}:${esPort}/translations/x/${esTranslationId}`);

        let translation = "";
        let targetWord = [];
        let author = [];
        let exampleSentence = "";
        let audioWord = [];
        let audioSentence = [];
        let upvotes = [];
        let downvotes = [];
        let id = [];
        let tags = [];
        let notes = [];

        targetWord.push(responseObject._source.question);
        translation = responseObject._source.answers[0].definition.translation;
        author.push(responseObject._source.answers[0].definition.author);
        exampleSentence = responseObject._source.answers[0].definition.exampleSentence;
        audioWord.push(responseObject._source.answers[0].definition.audioWord);
        audioSentence.push(responseObject._source.answers[0].definition.audioSentence);
        upvotes.push(responseObject._source.answers[0].definition.upvotes);
        downvotes.push(responseObject._source.answers[0].definition.downvotes);
        tags.push(responseObject._source.answers[0].definition.tags);
        id.push(responseObject._id);
        notes.push(responseObject._source.answers[0].definition.translatorNotes);
        console.log(targetWord);
        resp.render("edittranslation", {
            user: mreq.user,
            targetWord: targetWord,
            translation: translation,
            author: author,
            exampleSentence: exampleSentence,
            audioWord: audioWord,
            audioSentence: audioSentence,
            upvotes: upvotes,
            downvotes: downvotes,
            tags: tags,
            notes: notes,
            id: id,
            user: mreq.user,
            numberOfTranslations: 1
        });
    });
    
});

router.get('/viewtranslations', function (req, res) {
    esRequest({
        url: `${esUrl}:${esPort}/translations/_search`,
        method: 'GET',
        json: { "query": { "match": { "answers.definition.author": req.user.id } } }
    }, function (request, response) {

        let translationWords = [];
        let translationIds = [];

        for (let i = 0; i < response.body.hits.hits.length; i++) {
            translationWords.push(response.body.hits.hits[i]._source.question);
            translationIds.push(response.body.hits.hits[i]._id);
        }
        res.render('viewtranslations', {
            user: req.user,
            translationWords: translationWords,
            translationIds: translationIds
        });
    });       
});


// change username
router.get('/changeUsername', function (req, res) {
    req.logout();
    res.redirect('/auth/login');
});

module.exports = router;