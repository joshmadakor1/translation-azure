'use strict';
//const emojis           = ["凸(｀0´)凸","凸ಠ益ಠ)凸","凸(⊙▂⊙✖ )","┌П┐(►˛◄’!)","凸(-0-メ)","凸(｀⌒´メ)凸","凸(｀△´＋）","( ︶︿︶)_╭∩╮","凸(｀ι _´メ）","凸(>皿<)凸","凸(^▼ｪ▼ﾒ^)","t(=n=)","t(- n -)t","凸(¬‿¬)","(◣_◢)┌∩┐","┌∩┐(ಠ_ಠ)┌∩┐","╭∩╮(︶︿︶)╭∩╮","╭∩╮(-_-)╭∩╮","ᕕ༼ ͠ຈ Ĺ̯ ͠ຈ ༽┌∩┐","( ≧Д≦)","(；￣Д￣）","(;¬_¬)","（；¬＿¬)","(｡+･`ω･´)","｡゜(｀Д´)゜｡","(　ﾟДﾟ)＜!!","(‡▼益▼)","(,,#ﾟДﾟ)","(҂⌣̀_⌣́)","(；¬д¬)","（;≧皿≦）","(╬ﾟ◥益◤ﾟ)","(╬⓪益⓪)","[○･｀Д´･○]","૮( ᵒ̌▱๋ᵒ̌ )ა","(⁎˃ᆺ˂)","(ꐦ°᷄д°᷅)","((╬●∀●)","(╬ Ò ‸ Ó)","( >д<)","(*｀益´*)","(; ･`д･´)","(☞◣д◢)☞","<(｀^´)>","(;｀O´)o","(ꐦ ಠ皿ಠ )","（｀Δ´）！","(*｀Ω´*)","(╬ಠ益ಠ)","(╬ﾟ◥益◤ﾟ) ╬ﾟ","(ு⁎ு)྆྆","(╬⓪益⓪)","（╬ಠ益ಠ)","(●o≧д≦)o","=͟͟͞͞( •̀д•́)))","(๑･`▱´･๑)","༼ つ ͠° ͟ ͟ʖ ͡° ༽つ","(☄ฺ◣д◢)☄ฺ","ꀯ(‴ꑒ᷅⺫ꑒ᷄)","(#｀皿´)","(｀Д´)","(ﾒﾟ皿ﾟ)","(o｀ﾟ皿ﾟ)","( ╬◣ 益◢)","（╬ಠ益ಠ)","（♯▼皿▼）","( ╬◣ 益◢）y━･~","（○｀Ｏ´○）","(; ･`д･´)","｜。｀＞Д＜｜","(; ･`д･´)​","( •̀ω•́ )σ","૮(ꂧꁞꂧ)ა"];
const emojis = ["(҂⌣̀_⌣́)", "(҂⌣̀_⌣́)"];
const ES_MAXIMUM_QUERY_RESULT_SIZE = 25;
const multer = require('multer');
const AUDIO_LOCATION = "public/audio";
const AUDIO_AZURE = "https://hcisstorage.blob.core.windows.net/translations-audio"
var upload = multer({ dest: AUDIO_LOCATION});
var type = upload.single('upl');
const fs = require('fs');
const keys = require('../config/keys');
const bodyParser = require('body-parser');
const esRequest = require('request');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
//const esPort = 9200;
//const esUrl = "http://192.168.1.201";
const esPort = 9243;
const esUrl = keys.elasticSearch.url;
const translationType = "translations"
const path = require('path');
const storage = require('azure-storage');
const blobService = storage.createBlobService(keys.azureBlob.connectionString);
const containerName = "translations-audio";

module.exports = function (app) {

    function uploadLocalFile (containerName, filePath) {
        return new Promise((resolve, reject) => {
            const fullPath = path.resolve(filePath);
            const blobName = path.basename(filePath);
            blobService.createBlockBlobFromLocalFile(containerName, blobName, fullPath, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ message: `Local file "${filePath}" is uploaded` });
                }
            });
        });
    };

    function replace_Spaces_With_Underscores(term) {
        if (term !== null)
            term = term.replace(/ /g, '_');
        return term;
    }

    function replace_Underscores_With_Spaces(term) {
        if (term !== null)
            term = term.replace(/_/g, ' ');
        return term;
    }

    app.get('/contribute', function (mainRequest, mainResponse) {

        //If user is not logged in, redirect them to login page
        console.log(mainResponse.user);
        if (!mainRequest.user) {
            mainRequest.flash('danger', 'You must be logged in to answer translation requsts.');
            mainResponse.redirect('/auth/login');
            return;
        }

        let requestItem = esRequest({
            url: `${esUrl}:${esPort}/requests/_search`,
            method: 'GET',
            json: { "query": { "match_all": {} } }
        }, function (request, response) {
            if (response.body.error) {
                let error = JSON.stringify(response.body.error.root_cause[0].type);
                console.log('there was an error.');
                mainResponse.end(`<h1>ERROR</h1><h2>${error}</h2><h3><a href="mailto:josh.madakor@gmail.com">Notify Admin</a></h3>`);
                return;
            }
            //console.log(response.body.hits.hits);

            requestItem = response.body.hits;
            //console.log(response.body.hits.hits[0]);
            //console.log(response.body.hits.hits.length);

            let numberOfMatches = response.body.hits.hits.length;
            let question = [];
            let sourceLanguage = [];
            let destinationLanguage = [];
            let details = [];
            let tags = [];
            let requester = [];
            let id = [];

            for (let count = 0; count < numberOfMatches; count++) {
                question[count] = response.body.hits.hits[count]._source.question;
                sourceLanguage[count] = response.body.hits.hits[count]._source.sourceLanguage;
                destinationLanguage[count] = response.body.hits.hits[count]._source.destinationLanguage;
                details[count] = response.body.hits.hits[count]._source.details;
                tags[count] = response.body.hits.hits[count]._source.tags;
                requester[count] = response.body.hits.hits[count]._source.requester;
                details[count] = response.body.hits.hits[count]._source.details;
                id[count] = response.body.hits.hits[count]._id;
            }
            mainResponse.render("contribute", {
                question: question,
                sourceLanguage: sourceLanguage,
                destinationLanguage: destinationLanguage,
                details: details,
                tags: tags,
                requester: requester,
                id: id,
                user: mainRequest.user
            });
        });
    });

    app.get('/', function (mainRequest, mainResponse) {
        console.log(`--> get /`);
        let matches = null;
        // If user is clicking a word to see a definition.
        if (mainRequest.query.word !== undefined) {
            let targetWord = mainRequest.query.word;
            console.log('clicking word to see def');
            console.log(targetWord);

            let requestItem = esRequest({
                url: `${esUrl}:${esPort}/${translationType}/_search`,
                method: 'GET',
                json: { "query": { "match": { "question": targetWord } } }
            }, function (request, response) {
                if (response.body.error) {
                    let error = JSON.stringify(response.body.error.root_cause[0].type);
                    console.log('there was an error.');
                    mainResponse.end(`<h1>ERROR</h1><h2>${error}</h2><h3><a href="mailto:josh.madakor@gmail.com">Notify Admin</a></h3>`);
                    return;
                }
                //console.log(response.body.hits);
                let number_Of_Hits = response.body.hits.total;
                //console.log(requestItem.hits[0]);
                console.log(`NUMBER OF HITS: ${number_Of_Hits}`);
                let translation = [];
                let author = [];
                let exampleSentence = [];
                let audioWord = [];
                let audioSentence = [];
                let upvotes = [];
                let downvotes = [];
                let id = [];
                let tags = [];
                let notes = [];
                let question = [];
                let sourceLanguage = [];
                let destinationLanguage = [];
                
                try {
                    definitionArray = response.body.hits.hits[0]._source.answers
                }
                catch (error) {

                }
                for (let count = 0; count < number_Of_Hits; count++) {
                    question.push(response.body.hits.hits[count]._source.question);
                    sourceLanguage.push(response.body.hits.hits[count]._source.sourceLanguage);
                    destinationLanguage.push(response.body.hits.hits[count]._source.destinationLanguage);
                    translation.push(response.body.hits.hits[count]._source.answers[0].definition.translation);
                    author.push(response.body.hits.hits[count]._source.answers[0].definition.author);
                    exampleSentence.push(response.body.hits.hits[count]._source.answers[0].definition.exampleSentence);
                    audioWord.push(response.body.hits.hits[count]._source.answers[0].definition.audioWord);
                    audioSentence.push(response.body.hits.hits[count]._source.answers[0].definition.audioSentence);
                    upvotes.push(response.body.hits.hits[count]._source.answers[0].definition.upvotes);
                    downvotes.push(response.body.hits.hits[count]._source.answers[0].definition.downvotes);
                    tags.push(response.body.hits.hits[count]._source.answers[0].definition.tags);
                    id.push(response.body.hits.hits[count]._id);
                    notes.push(response.body.hits.hits[count]._source.answers[0].definition.translatorNotes);
                }
                
                    
                
                console.log('rendering this ho');

                // This will happen if the user goes straight to a defintion URL without searching
                if (mainRequest.session.message === undefined) {
                    mainRequest.session.message = `{\"sessionID\":\"${mainRequest.sessionID}\",\"matches\":[\"${targetWord}\"]}`;
                }

                let jsonObject = JSON.parse(mainRequest.session.message);
                let jsonStuff = {
                    sessionID: mainRequest.sessionID,
                    matches: jsonObject.matches
                }
                mainRequest.session.message = JSON.stringify(jsonStuff);

                console.log(`TOTAL TRANSLATIONS --------------- ${number_Of_Hits} -----------`)
                mainResponse.render("index", {
                    numberOfTranslations: number_Of_Hits,
                    targetWord: question,
                    translation: translation,
                    author: author,
                    exampleSentence: exampleSentence,
                    audioWord: audioWord,
                    audioSentence: audioSentence,
                    upvotes: upvotes,
                    downvotes: downvotes,
                    sessionID: mainRequest.sessionID,
                    matches: jsonObject.matches,
                    tags: tags,
                    notes: notes,
                    id: id,
                    user: mainRequest.user,
                    sourceLanguage: sourceLanguage,
                    destinationLanguage: destinationLanguage
                });
            })

        }
        else {
            
                // First time the page has load, or no search matches have been inserted into request.message
            console.log('first time page has loaded');
            console.log(`${esUrl}:${esPort}/${translationType}/_search`)
                let requestItem = esRequest({
                    url: `${esUrl}:${esPort}/${translationType}/_search`,
                    method: 'GET',
                    json: {
                        "from": 0,
                        "size": 18,
                        "query":
                        {
                            "wildcard": { "question": "*" }
                        }
                    }
                }, function (request, response) {
                    //load random word for first page load
                    if (!response) {
                        mainResponse.end(`<h1>ERROR</h1><h2>Search Enginge Database not found.</h2><h3><a href="mailto:josh.madakor@gmail.com">Notify Admin</a></h3>`);
                        return;
                    }
                    if (response.body.error) {
                        let error = JSON.stringify(response.body.error.root_cause[0].type);
                        console.log('there was an error.');
                        mainResponse.end(`<h1>ERROR</h1><h2>${error}</h2><h3><a href="mailto:josh.madakor@gmail.com">Notify Admin</a></h3>`);
                        return;
                    }
                    let rand = Math.floor((Math.random() * (response.body.hits.hits.length - 1))); //TODO: Fix this so it's more randomized
                    requestItem = response.body.hits;
                    let targetWord = "";
                    try {
                        targetWord = response.body.hits.hits[rand]._source.question;
                    }
                    catch (error) {

                    }


                    let jsonStuff = {
                        sessionID: mainRequest.sessionID,
                        matches: targetWord
                    }
                    mainRequest.session.message = JSON.stringify(jsonStuff);
                    console.log(`${targetWord}`);
                    mainResponse.redirect(`/?word=${targetWord}`);
                });
            
        }
    });

    app.get('/request', function (request, response) {
     
        if (request.user !== undefined) {
            response.render("request", {
                user: request.user.id
            });
        }
        else {
            request.flash('danger', 'You must be logged in to request a translation.');
            response.redirect('/auth/login');
        }
    });

    app.post('/request', function (request, response) {
        console.log('--> post /request');

        esRequest({
            url: `${esUrl}:${esPort}/requests/x`,
            method: 'POST',
            contentType: "application/json",
            json: {
                "sourceLanguage": request.body.sourceLanguage,
                "destinationLanguage": request.body.destinationLanguage,
                "question": request.body.term,
                "details": request.body.details,
                "tags": request.body.tags,
                "requester": request.user.id,
            }
        },
            function (req, res) {
                if (res.body.error) {
                    let error = JSON.stringify(res.body.error.root_cause[0].type);
                    console.log('there was an error.');
                    mainResponse.end(`<h1>ERROR</h1><h2>${error}</h2><h3><a href="mailto:josh.madakor@gmail.com">Notify Admin</a></h3>`);
                    response.sendStatus(500);
                    return;
                }
                response.sendStatus(200);
                console.log(res.body);
                return;
            });
    })

    app.get('/add', function (request, response) {
        console.log(`--> get /add`)
        response.render('add', {
            user: request.user
        })
    });

    app.post('/delete', function (req, mres) {
        if (!req.query.id) { res.sendStatus(500); }
        let translationId = req.query.id;
        esRequest({
            url: `${esUrl}:${esPort}/translations/x/${translationId}/`,
            method: 'DELETE'
        }, function (req, res) {
            
            if (res.body.indexOf("deleted") > 0) {
                mres.sendStatus(200);
            }
            else {
                mres.sendStatus(500);
            }
        });
    });
    
    app.post('/submitEdit', function (mainRequest, mainResponse) {
        console.log('-------------- /submitEdit')
        console.log(mainRequest.body);
        esRequest({
            url: `${esUrl}:${esPort}/translations/x/${mainRequest.body.id}/_update`,
            method: 'POST',
            contentType: "application/json",
            json: {
                "script": `ctx._source.sourceLanguage='${mainRequest.body.sourceLanguage}';` +
                    `ctx._source.destinationLanguage='${mainRequest.body.destinationLanguage}';` +
                    `ctx._source.question='${mainRequest.body.term}';` +
                    `ctx._source.answers[0].definition.translation='${mainRequest.body.wordTranslation}';` +
                    `ctx._source.answers[0].definition.exampleSentence='${mainRequest.body.sentenceTranslation}';` +
                    `ctx._source.answers[0].definition.audioWord='${mainRequest.body.audioWord}';` +
                    `ctx._source.answers[0].definition.audioSentence='${mainRequest.body.audioSentence}';` +
                    `ctx._source.answers[0].definition.translatorNotes='${mainRequest.body.translatorNotes}';` +
                    `ctx._source.answers[0].definition.tags='${mainRequest.body.tags}';`

            }
        },  function (request, response) {
                if (response.body.error) {
                    let error = JSON.stringify(response.body.error.root_cause[0].type);
                    console.log(response.body.error);
                    console.log('there was an error.');
                    mainResponse.end(`<h1>ERROR</h1><h2>${error}</h2><h3><a href="mailto:josh.madakor@gmail.com">Notify Admin</a></h3>`);
                    return;
                }
                let result = response.body.result;
                console.log("result ------------------------------");
                console.log(result);

                if (result === "updated" || result === "created") {

                    mainResponse.sendStatus(200);
                }
                else {
                    //If Elasticsearch failed to update/add the record, send a failure status
                    mainResponse.sendStatus(500)
                }

            });

    });

    app.post('/submitDef', function (mainRequest, mainResponse) {
        console.log('post /submitDef')
        //renderPage(response,"submitDef");
        //console.log(replace_Spaces_With_Underscores(mainRequest.body.term))
        console.log(`${esUrl}:${esPort}/${translationType}/x`);
        //console.log(mainRequest.body);
        esRequest({
            url: `${esUrl}:${esPort}/${translationType}/x`,
            method: 'POST',
            contentType: "application/json",
            json: {
                "sourceLanguage": mainRequest.body.sourceLanguage,
                "destinationLanguage": mainRequest.body.destinationLanguage,
                "question": mainRequest.body.term,
                "submitter": mainRequest.user.id,
                "answers": [
                    {
                        "definition": {
                            "translation": mainRequest.body.wordTranslation,
                            "exampleSentence": mainRequest.body.sentenceTranslation,
                            "author": mainRequest.user.id,
                            "upvotes": 0,
                            "downvotes": 0,
                            "audioWord": mainRequest.body.audioWord,
                            "audioSentence": mainRequest.body.audioSentence,
                            "translatorNotes": mainRequest.body.translatorNotes,
                            "tags": mainRequest.body.tags
                        }
                    }
                ]
            }
        },
            
            function (request, response) {
                if (response.body.error) {
                    let error = JSON.stringify(response.body.error.root_cause[0].type);
                    console.log('there was an error.');
                    mainResponse.end(`<h1>ERROR</h1><h2>${error}</h2><h3><a href="mailto:josh.madakor@gmail.com">Notify Admin</a></h3>`);
                    return;
                }
                let result = response.body.result;
                console.log("result ------------------------------");
                console.log(result);
                
                if (result === "updated" || result === "created") {
                    console.log(replace_Spaces_With_Underscores(mainRequest.body.term));
                    //If Elasticsearch could update/add the record, send a success status
                    esRequest({
                        url: `${esUrl}:${esPort}/requests/x/${mainRequest.body.id}`,
                        method: 'DELETE'
                    },
                        function (request, response) {

                            mainResponse.sendStatus(200);
                        });
                }
                else {
                    //If Elasticsearch failed to update/add the record, send a failure status
                    mainResponse.sendStatus(500)
                }
                
            });

    });

    // Text is changed on the main page search bar, update autocomplete results
    //TODO: If a definition already exists with the same "question", add it as an item to the answers array
    app.post('/', urlencodedParser, function (mainRequest, mainResponse) {
        console.log(`--> post /  mainRequest.body.question ${mainRequest.body.question}`);
        let searchTerm = null;
        let searchMatches = [];
        let jsonStuff = {}

        // Set searchTerm, which will be used to conduct the Elasticsearch Query
        if (mainRequest.body.question === "") {
            searchTerm = "";
        }
        else {
            searchTerm = `${mainRequest.body.question}`.toLowerCase();
        }

        //This is to determine if it is a non-ascii character (japanese, for example)
        var non_English_Regex = /([^\x00 -\x7F]+)/g;
  

        if (searchTerm.indexOf(" ") > 0 || (searchTerm.match(non_English_Regex) !== null)) {
            //if (searchTerm.length > 0) {
            // If the search term has a space in it, use Query --> Match
            esRequest({
                url: `${esUrl}:${esPort}/${translationType}/_search`,
                method: 'GET',
                json: {
                    "from": 0, "size": 1000,
                    "query": {
                        "match": { "question": searchTerm }
                    }
                }
            },
                function (request, response) {
                    if (response.body.error) {
                        let error = JSON.stringify(response.body.error.root_cause[0].type);
                        console.log('there was an error.');
                        mainResponse.end(`<h1>ERROR</h1><h2>${error}</h2><h3><a href="mailto:josh.madakor@gmail.com">Notify Admin</a></h3>`);
                        return;
                    }
                    let count = 0;
                    let wordToBePushedIntoAutocompleteResults = "";
                    let translationToBePushedIntoAutocompleteResults = ""
                    let numberOfSearchHits = response.body.hits.total;
                    if (numberOfSearchHits > 0) {
                        for (var hit in response.body.hits.hits) {
                            wordToBePushedIntoAutocompleteResults = response.body.hits.hits[count]._source.question;
                            searchMatches.push(wordToBePushedIntoAutocompleteResults);
                            count++;
                        }
                    }

                    jsonStuff = {
                        sessionID: mainRequest.sessionID,
                        matches: searchMatches
                    }
                    mainRequest.session.message = JSON.stringify(jsonStuff);
                    mainResponse.render('index', {
                        sessionID: mainRequest.sessionID,
                        matches: searchMatches,
                        numberOfTranslations: 0,
                        user: mainRequest.user
                    });
                });

        } else {
            if (searchTerm !== "") {
                searchTerm = `*${searchTerm}*`
            }
            // If the search term has no spaces in it, use Query --> Wildcard
            esRequest({
                url: `${esUrl}:${esPort}/${translationType}/_search`,
                method: 'GET',
                json: {
                    "from": 0, "size": ES_MAXIMUM_QUERY_RESULT_SIZE,
                    "query": {
                        "wildcard": { "question": searchTerm }
                    }
                }
            },
                function (request, response) {
                    if (response.body.error) {
                        let error = JSON.stringify(response.body.error.root_cause[0].type);
                        console.log('there was an error.');
                        mainResponse.end(`<h1>ERROR</h1><h2>${error}</h2><h3><a href="mailto:josh.madakor@gmail.com">Notify Admin</a></h3>`);
                        return;
                    }
                    let count = 0;
                    let wordToBePushedIntoAutocompleteResults = "";
                    let translationToBePushedIntoAutocompleteResults = ""
                    let numberOfSearchHits = response.body.hits.total;
                    if (numberOfSearchHits > 0) {
                        for (var hit in response.body.hits.hits) {
                            wordToBePushedIntoAutocompleteResults = response.body.hits.hits[count]._source.question;
                            if (!searchMatches.includes(wordToBePushedIntoAutocompleteResults)) {
                                searchMatches.push(wordToBePushedIntoAutocompleteResults);
                            }
                            count++;
                        }
                    }

                    jsonStuff = {
                        sessionID: mainRequest.sessionID,
                        matches: searchMatches
                    }
                    mainRequest.session.message = JSON.stringify(jsonStuff);
                    mainResponse.render('index', {
                        sessionID: mainRequest.sessionID,
                        matches: searchMatches,
                        numberOfTranslations: 0,
                        user: mainRequest.user
                    });
                });
        }




    });

    app.post('/upvote', function (req, res) {
        console.log(req.query.id);
        let translationId = req.query.id;

        //res.json({ "count": 44 });
        //res.sendStatus(200);

        esRequest({
            url: `${esUrl}:${esPort}/translations/x/${translationId}/_update`,
            method: 'POST',
            json: { "script": "ctx._source.answers[0].definition.upvotes+=1;" }
        }, function (request, response) {
            
            if (JSON.stringify(response.body).indexOf('updated') > 0) {
                res.sendStatus(200);
            }
            else {
                res.sendStatus(500);
            }
            
        });
    });

    app.post('/downvote', function (req, res) {
        console.log(req.query.id);
        let translationId = req.query.id;

        //res.json({ "count": 44 });
        //res.sendStatus(200);

        esRequest({
            url: `${esUrl}:${esPort}/translations/x/${translationId}/_update`,
            method: 'POST',
            json: { "script": "ctx._source.answers[0].definition.downvotes+=1;" }
        }, function (request, response) {

            if (JSON.stringify(response.body).indexOf('updated') > 0) {
                res.sendStatus(200);
            }
            else {
                res.sendStatus(500);
            }

        });
    });



    app.post("/uploadAudio", type, function (request, response) {
        console.log(`OLD: ${AUDIO_LOCATION}\\${request.file.filename}`);
        console.log(`NEW: ${AUDIO_LOCATION}\\${request.file.originalname}`);
        
        
        fs.rename(`${AUDIO_LOCATION}/${request.file.filename}`, `${AUDIO_LOCATION}/${request.file.originalname}`, function (err) {
            if (err) { 
                console.log(err);
            }
            else {
                
                uploadLocalFile(containerName,`${AUDIO_LOCATION}/${request.file.originalname}`);
            }
        })
        /*
        fs.rename(`${AUDIO_LOCATION}\\${request.file.filename}`, `${AUDIO_LOCATION}\\${request.file.originalname}`, function (err) {
            console.log(err);
        });*/
        
    });

    app.get('/answer', function (mainRequest, mainResponse) {
        //let targetWord = mainRequest.query.word;

        let targetId = mainRequest.query._id;

        esRequest({
            url: `${esUrl}:${esPort}/requests/_search`,
            method: 'GET',
            json: { "query": { "match": { "_id": targetId } } }
        }, function (request, response) {
            if (response.body.error) {
                let error = JSON.stringify(response.body.error.root_cause[0].type);
                console.log('there was an error.');
                mainResponse.end(`<h1>ERROR</h1><h2>${error}</h2><h3><a href="mailto:josh.madakor@gmail.com">Notify Admin</a></h3>`);
                return;
            }
            let sourceLanguage = null;
            let destinationLanguage = null;
            let question = null;
            let details = null;
            let tags = null;
            let requester = null;
            let id = [];

            sourceLanguage = response.body.hits.hits[0]._source.sourceLanguage;
            destinationLanguage = response.body.hits.hits[0]._source.destinationLanguage;
            question = response.body.hits.hits[0]._source.question;
            details = response.body.hits.hits[0]._source.details;
            tags = response.body.hits.hits[0]._source.tags;
            requester = response.body.hits.hits[0]._source.requester;
            id = targetId
            console.log(targetId);
            mainResponse.render("answer", {
                sourceLanguage: sourceLanguage,
                destinationLanguage: destinationLanguage,
                question: question,
                details: details,
                tags: tags,
                requester: requester,
                targetWord: question,
                id: targetId,
                user: mainRequest.user.id
            });
        });
    });
}
