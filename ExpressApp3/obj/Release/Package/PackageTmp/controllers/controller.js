'use strict';
//const emojis           = ["凸(｀0´)凸","凸ಠ益ಠ)凸","凸(⊙▂⊙✖ )","┌П┐(►˛◄’!)","凸(-0-メ)","凸(｀⌒´メ)凸","凸(｀△´＋）","( ︶︿︶)_╭∩╮","凸(｀ι _´メ）","凸(>皿<)凸","凸(^▼ｪ▼ﾒ^)","t(=n=)","t(- n -)t","凸(¬‿¬)","(◣_◢)┌∩┐","┌∩┐(ಠ_ಠ)┌∩┐","╭∩╮(︶︿︶)╭∩╮","╭∩╮(-_-)╭∩╮","ᕕ༼ ͠ຈ Ĺ̯ ͠ຈ ༽┌∩┐","( ≧Д≦)","(；￣Д￣）","(;¬_¬)","（；¬＿¬)","(｡+･`ω･´)","｡゜(｀Д´)゜｡","(　ﾟДﾟ)＜!!","(‡▼益▼)","(,,#ﾟДﾟ)","(҂⌣̀_⌣́)","(；¬д¬)","（;≧皿≦）","(╬ﾟ◥益◤ﾟ)","(╬⓪益⓪)","[○･｀Д´･○]","૮( ᵒ̌▱๋ᵒ̌ )ა","(⁎˃ᆺ˂)","(ꐦ°᷄д°᷅)","((╬●∀●)","(╬ Ò ‸ Ó)","( >д<)","(*｀益´*)","(; ･`д･´)","(☞◣д◢)☞","<(｀^´)>","(;｀O´)o","(ꐦ ಠ皿ಠ )","（｀Δ´）！","(*｀Ω´*)","(╬ಠ益ಠ)","(╬ﾟ◥益◤ﾟ) ╬ﾟ","(ு⁎ு)྆྆","(╬⓪益⓪)","（╬ಠ益ಠ)","(●o≧д≦)o","=͟͟͞͞( •̀д•́)))","(๑･`▱´･๑)","༼ つ ͠° ͟ ͟ʖ ͡° ༽つ","(☄ฺ◣д◢)☄ฺ","ꀯ(‴ꑒ᷅⺫ꑒ᷄)","(#｀皿´)","(｀Д´)","(ﾒﾟ皿ﾟ)","(o｀ﾟ皿ﾟ)","( ╬◣ 益◢)","（╬ಠ益ಠ)","（♯▼皿▼）","( ╬◣ 益◢）y━･~","（○｀Ｏ´○）","(; ･`д･´)","｜。｀＞Д＜｜","(; ･`д･´)​","( •̀ω•́ )σ","૮(ꂧꁞꂧ)ა"];
const emojis = ["(҂⌣̀_⌣́)", "(҂⌣̀_⌣́)"];
const ES_MAXIMUM_QUERY_RESULT_SIZE = 25;
const multer = require('multer');
const AUDIO_LOCATION = "public/audio";
var upload = multer({ dest: AUDIO_LOCATION});
var type = upload.single('upl');
const fs = require('fs');

const bodyParser = require('body-parser');
const esRequest = require('request');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
//const esPort = 9200;
//const esUrl = "http://192.168.1.201";
const esPort = 9243;
const esUrl = "https://elastic:phwEbiaOAKvULVw8rsfq7VCD@e4ba45ba778443198d78e0d109ed6131.us-west1.gcp.cloud.es.io";
const translationType = "translations"

module.exports = function (app) {



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

    app.get('/earn', function (mainRequest, mainResponse) {
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
            let bounty = [];
            let id = [];

            for (let count = 0; count < numberOfMatches; count++) {
                question[count] = response.body.hits.hits[count]._source.question;
                sourceLanguage[count] = response.body.hits.hits[count]._source.sourceLanguage;
                destinationLanguage[count] = response.body.hits.hits[count]._source.destinationLanguage;
                details[count] = response.body.hits.hits[count]._source.details;
                tags[count] = response.body.hits.hits[count]._source.tags;
                requester[count] = response.body.hits.hits[count]._source.requester;
                bounty[count] = response.body.hits.hits[count]._source.bounty;
                id[count] = response.body.hits.hits[count]._id;
            }
            mainResponse.render("earn", {
                question: question,
                sourceLanguage: sourceLanguage,
                destinationLanguage: destinationLanguage,
                details: details,
                tags: tags,
                requester: requester,
                bounty: bounty,
                id: id
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
                
                try {
                    definitionArray = response.body.hits.hits[0]._source.answers
                }
                catch (error) {

                }
                for (let count = 0; count < number_Of_Hits; count++) {
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
                    targetWord: targetWord,
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
                    id: id
                });
            })

        }
        else {
            try {
                // if the search matches have been inserted into request.message
                console.log('user searching for word');
                let jsonObject = JSON.parse(mainRequest.session.message);
                mainResponse.render("index", {
                    sessionID: mainRequest.sessionID,
                    matches: jsonObject.matches,
                    numberOfTranslations: 0
                })
            }
            catch (error) {
                // First time the page has load, or no search matches have been inserted into request.message
                console.log('first time page has loaded');

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
        }
    });

    app.get('/request', function (request, response) {
        response.render("request");
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
                "requester": request.body.requester,
                "bounty": request.body.bounty
            }
        },
            function (request, response) {
                if (response.body.error) {
                    let error = JSON.stringify(response.body.error.root_cause[0].type);
                    console.log('there was an error.');
                    mainResponse.end(`<h1>ERROR</h1><h2>${error}</h2><h3><a href="mailto:josh.madakor@gmail.com">Notify Admin</a></h3>`);
                    return;
                }
                console.log(response.body);
            });
    })

    app.get('/add', function (request, response) {
        console.log(`--> get /add`)
        response.render('add')
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
                "submitter": mainRequest.body.author,
                "answers": [
                    {
                        "definition": {
                            "translation": mainRequest.body.wordTranslation,
                            "exampleSentence": mainRequest.body.sentenceTranslation,
                            "author": mainRequest.body.author,
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
                        numberOfTranslations: 0
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
                        numberOfTranslations: 0
                    });
                });
        }




    });

    app.post("/uploadAudio", type, function (request, response) {
        console.log(`OLD: ${AUDIO_LOCATION}\\${request.file.filename}`);
        console.log(`NEW: ${AUDIO_LOCATION}\\${request.file.originalname}`);
        
        
        fs.rename(`${AUDIO_LOCATION}/${request.file.filename}`, `${AUDIO_LOCATION}/${request.file.originalname}`, function (err) {
            console.log(err);
        });
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
            let bounty = null;
            let id = [];

            sourceLanguage = response.body.hits.hits[0]._source.sourceLanguage;
            destinationLanguage = response.body.hits.hits[0]._source.destinationLanguage;
            question = response.body.hits.hits[0]._source.question;
            bounty = response.body.hits.hits[0]._source.bounty;
            details = response.body.hits.hits[0]._source.details;
            tags = response.body.hits.hits[0]._source.tags;
            requester = response.body.hits.hits[0]._source.requester;
            id = targetId
            console.log(targetId);
            mainResponse.render("answer", {
                sourceLanguage: sourceLanguage,
                destinationLanguage: destinationLanguage,
                question: question,
                bounty: bounty,
                details: details,
                tags: tags,
                requester: requester,
                targetWord: question,
                id: targetId
            });
        });
    });
}
