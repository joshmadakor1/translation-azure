$(document).ready(function(){

    let changeTimer = false;

    $('form input').on('input propertychange paste', function() {

        if(changeTimer !== false) clearTimeout(changeTimer);
        changeTimer = setTimeout(function(){
        var searchText = $('form input');
        searchText = searchText.val()
        console.log(searchText);
        var currentText = {question: searchText};
        $.ajax({
            type: 'POST',
            url: `/`,
            cache: false,
            data: currentText,
            success: function (data) {
                $("#autocomplete-Results").load(" #autocomplete-Results");
                if (entries_Exist_In_The_Autocomplete_List(data)) {
                    let htmlAutocompleteString = extract_Autocomplete_Items(data);
                    document.getElementById('autocomplete-Results').innerHTML = htmlAutocompleteString

                }
            }
        });
        changeTimer = false;
        },300);
    });

    function entries_Exist_In_The_Autocomplete_List(htmlData) {
        if (htmlData.indexOf('autocomplete-Font') > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    function extract_Autocomplete_Items(htmlData) {
        let htmlArray = htmlData.split("\n");
        let renderArray = [];
        let found_Unordered_List = false;
        let finished_Unordered_List = false;
        let htmlString = "";

        for (let i = 0; i < htmlArray.length; i++)
        {
            if (htmlArray[i].indexOf("autocomplete-Ul") > 0) {
                found_Unordered_List = true;
            }
            if (found_Unordered_List && finished_Unordered_List !== true) {
                renderArray.push(htmlArray[i]);
                if (htmlArray[i].indexOf("</ul>") > 0) {
                    finished_Unordered_List = true;
                }
            }
        }

        for (let i = 0; i < renderArray.length; i++) {
            htmlString += renderArray[i].trim();
        }

        return htmlString;
    }

    $('#editDisplayName').unbind("click").click(function () {
        let newUrl = window.location.protocol + "//" + window.location.host + "/profile/changename";
        window.location.href = newUrl;
    });

    $('#submitRequest').unbind("click").click(function () {
        let term = document.getElementById("requestTerm").value;
        let details = document.getElementById("TranslatorNotes").value;
        //let tags = document.getElementById("requestTags").value;
        let sourceLanguage = document.getElementById("sourceLanguage").value;
        let destinationLanguage = document.getElementById("destinationLanguage").value;
        //let requester = document.getElementById("requester").value;
        //let bounty = document.getElementById("bounty").value;
        

        let requestSubmission = {
            term: term,
            details: details,
            sourceLanguage: sourceLanguage,
            destinationLanguage: destinationLanguage,
        }

        if (validate_Json_Submission(requestSubmission)) {
            $.ajax({
                type: 'POST',
                url: '/request',
                cache: false,
                contentType: 'application/json',
                data: JSON.stringify(requestSubmission),
                success: function(data){
                    console.log(data);
                    console.log('Post Success!');
                    let newUrl = window.location.protocol + "//" + window.location.host + "/contribute";
                    window.location.href = newUrl;
                }
            });
        }
        else {
            alert("make sure to fill in all the fields");
        }
    });



    $('#submitWord').unbind("click").click(function () {

        let sourceLanguage = document.getElementById("sourceLanguage").value;
        let destinationLanguage = document.getElementById("destinationLanguage").value;

        if (sourceLanguage === destinationLanguage) {
            alert("Source language and destination language cannot be the same.");
            return;
        }

        if (document.getElementById("audiolink1") === null || document.getElementById("audiolink2") === null) {
            alert("You must submit audio recordings.");
            return;
        }
        
        let term = document.getElementById("term").value;
        if (term === undefined) {
          term = document.getElementById("term").innerHTML;
        }
        let wordTranslation = (document.getElementById("WordTranslation").value).replace(/\n/g,",,,");
        //let audioWord = document.getElementById("audioWord").value;
        let sentenceTranslation = (document.getElementById("SentenceTranslation").value).replace(/\n/g, ",,,");
        //let audioSentence = document.getElementById("audioSentence").value;
        let translatorNotes = document.getElementById("TranslatorNotes").value;
        let tags = document.getElementById("Tags").value;
        let audioWord = document.getElementById("audiolink1").download;
        let audioSentence = document.getElementById("audiolink2").download;
        let id = null;

        try {
            id = document.getElementById("hiddenP").innerHTML;
        }
        catch (error) {
            console.log(error);
        }
        

        //console.log(term);
        let translationSubmission = {
            term: term,
            wordTranslation: wordTranslation,
            sentenceTranslation: sentenceTranslation,
            translatorNotes: translatorNotes,
            tags: tags,
            audioWord: audioWord,
            audioSentence: audioSentence,
            sourceLanguage: sourceLanguage,
            destinationLanguage: destinationLanguage,
            id: id
        }

        if (validate_Json_Submission(translationSubmission)) {
            $.ajax({
                type: 'POST',
                url: '/submitDef',
                cache: false,
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(translationSubmission),
                dataType: "text",
                success: function(data){
                  console.log('Post Success!');
                  let newUrl = window.location.protocol + "//" + window.location.host + "/";
                  window.location.href = newUrl;
                },
                error: function(error) {
                  console.log("Post Error!\n" + error);
                },
                complete: function (textStatus, errorThrown) {
                  console.log('penis');
                }
              });

        }
        else {
            alert("make sure to fill in all the fields");
            return;
        }
    });

    
    $('#submitEdit').unbind("click").click(function () {

        let sourceLanguage = document.getElementById("sourceLanguage").value;
        let destinationLanguage = document.getElementById("destinationLanguage").value;

        if (sourceLanguage === destinationLanguage) {
            alert("Source language and destination language cannot be the same.");
            return;
        }

        if (document.getElementById("audiolink1") === null || document.getElementById("audiolink2") === null) {
            alert("You must submit audio recordings.");
            return;
        }

        let term = document.getElementById("term").value;
        if (term === undefined) {
            term = document.getElementById("term").innerHTML;
        }
        let wordTranslation = (document.getElementById("WordTranslation").value).replace(/\n/g,",,,");
        //let audioWord = document.getElementById("audioWord").value;
        let sentenceTranslation = (document.getElementById("SentenceTranslation").value).replace(/\n/g, ",,,");
        //let audioSentence = document.getElementById("audioSentence").value;
        let translatorNotes = document.getElementById("TranslatorNotes").value;
        let tags = document.getElementById("Tags").value;
        let audioWord = document.getElementById("audiolink1").download;
        let audioSentence = document.getElementById("audiolink2").download;
        let id = document.getElementById("translationId").value;

       

        //console.log(term);
        let translationSubmission = {
            term: term,
            wordTranslation: wordTranslation,
            sentenceTranslation: sentenceTranslation,
            translatorNotes: translatorNotes,
            tags: tags,
            audioWord: audioWord,
            audioSentence: audioSentence,
            sourceLanguage: sourceLanguage,
            destinationLanguage: destinationLanguage,
            id: id
        }

        if (validate_Json_Submission(translationSubmission)) {
            $.ajax({
                type: 'POST',
                url: '/submitEdit',
                cache: false,
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(translationSubmission),
                dataType: "text",
                success: function (data) {
                    console.log('Post Success!');
                    let newUrl = window.location.protocol + "//" + window.location.host + "/";
                    window.location.href = newUrl;
                },
                error: function (error) {
                    console.log("Post Error!\n" + error);
                },
                complete: function (textStatus, errorThrown) {

                }
            });

        }
        else {
            alert("make sure to fill in all the fields");
            return;
        }
    });






    $('#submitnamechange').unbind("click").click(function () {

        var newName = document.getElementById("newname").value
        console.log(newName);
        
        var newValues = { firstName: newName };
        console.log(newValues);
        
        $.ajax({
            type: 'POST',
            url: '/profile/changename',
            cache: false,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(newValues),
            dataType: "text",
            success: function (data) {
                var data = JSON.parse(data);
                var errorMessages = "";
                console.log('Post Success!');
                console.log(data);
                if (data.errors) {
                    let numberOfErrors = data.errors.length;
                    let count = 0;
                    while (count < numberOfErrors) {
                        console.log(data.errors[count].msg);
                        errorMessages += ("<div class=\"container alert alert-danger\">" + data.errors[count].msg + "</div>");
                        count++;
                    }
                    document.getElementById("messages").innerHTML = errorMessages;
                }
                else {
                    let newUrl = window.location.protocol + "//" + window.location.host + "/profile";
                    window.location.href = newUrl;
                }
                
                
            },
            error: function (data) {
                console.log(data);
                let newUrl = window.location.protocol + "//" + window.location.host + "/profile/changename";
                //window.location.href = newUrl;
            },
            complete: function (req, res, err) {
                console.log('complete');
            }
        });

    });








    $('#upvote').unbind("click").click(function () {

        let translationId = document.getElementById("translationId").innerHTML;
        let votecount = document.getElementById("upvote").innerHTML.split(" ")[0];
        console.log(votecount);
       
        $.ajax({
            type: 'POST',
            url: `/upvote/?id=${translationId}`,
            cache: false,
            contentType: "application/json; charset=utf-8",
            dataType: "text",
            success: function (data) {
                //let jsonResponse = JSON.parse(data);
                console.log(data);
                //console.log(jsonResponse.count);
                console.log('Post Success!');
                votecount = ++votecount;
                console.log(votecount);
                document.getElementById("upvote").innerHTML = (votecount + " &#128077;");
                //let newUrl = window.location.protocol + "//" + window.location.host + "/";
                //window.location.href = newUrl;
            },
            error: function (error) {
                console.log("Post Error!\n" + error);
            },
            complete: function (textStatus, errorThrown) {
                console.log('complete.');
            }
        });
    });

    $('#downvote').unbind("click").click(function () {

        let translationId = document.getElementById("translationId").innerHTML;
        let votecount = document.getElementById("downvote").innerHTML.split(" ")[0];
        console.log(votecount);

        $.ajax({
            type: 'POST',
            url: `/downvote/?id=${translationId}`,
            cache: false,
            contentType: "application/json; charset=utf-8",
            dataType: "text",
            success: function (data) {
                //let jsonResponse = JSON.parse(data);
                console.log(data);
                //console.log(jsonResponse.count);
                console.log('Post Success!');
                votecount = ++votecount;
                console.log(votecount);
                document.getElementById("downvote").innerHTML = (votecount + " &#128078;");
                //let newUrl = window.location.protocol + "//" + window.location.host + "/";
                //window.location.href = newUrl;
            },
            error: function (error) {
                console.log("Post Error!\n" + error);
            },
            complete: function (textStatus, errorThrown) {
                console.log('complete.');
            }
        })
    });










    $('#deleteTranslation').unbind("click").click(function () {
        console.log('hi');
        console.log(document.getElementById("translationId").value);
        let translationId = document.getElementById("translationId").value;
        let deleteTranslation = confirm(`You sure you want to PERMANENTLY delete the translation? All upvotes/downvotes from it will be lost.`);
        console.log(deleteTranslation);
        if (!deleteTranslation) { return; }
        console.log('deleting translation.'); 
        $.ajax({
            type: 'POST',
            url: `/delete/?id=${translationId}`,
            cache: false,
            contentType: "application/json; charset=utf-8",
            dataType: "text",
            success: function (data) {
                console.log('Post Success!');
                //let newUrl = window.location.protocol + "//" + window.location.host + "/";
                //window.location.href = newUrl;
            },
            error: function (error) {
                console.log("Post Error!\n" + error);
            },
            complete: function (textStatus, errorThrown) {
                console.log('complete.');
                let newUrl = window.location.protocol + "//" + window.location.host + "/profile/viewtranslations";
                window.location.href = newUrl;
            }
        });
    });

    $('#submitAnswer').on('click', function() {
      let targetWord = document.getElementById("targetAnswer").innerHTML;
      targetWord = replace_Spaces_With_Underscores(targetWord.trim());
      console.log(targetWord);


    });

    function replace_Spaces_With_Underscores(term){
        if (term !== null)
        term = term.replace(/ /g, '_');
        return term;
    }

    function validate_Json_Submission(submission) {
        for (var property in submission) {
            if (submission[property] === "") {
                return false;
            }
        }
        return true;
    }


    $('form input').on('focusout', function() {
        setTimeout(function(){
            var autocompleteResults = document.getElementById("autocomplete-Results");
            autocompleteResults.style.display = "none";
        },300);
    });

    $('form input').on('focus', function() {
        var autocompleteResults = document.getElementById("autocomplete-Results");
        if (autocompleteResults != null) {
            autocompleteResults.style.display = "block";
        }
        console.log('gaining focus!');
        if(changeTimer !== false) clearTimeout(changeTimer);
      changeTimer = setTimeout(function(){
      var searchText = $('form input');
      var currentText = {question: searchText.val()};

      $.ajax({
        type: 'POST',
        url: `/`,
        cache: false,
        data: currentText,
        success: function(data){
          $("#autocomplete-Results").load(" #autocomplete-Results");
        }
      });
      changeTimer = false;
      },300);
    });

    $(window).on('load', function(){
        if (document.getElementById("searchInput") !== null){
            document.getElementById("searchInput").focus();
        }
    });
  });

function playWord() {
    var audio = document.getElementById("audioWord");
    audio.play();
}

function playSentence() {
    var audio = document.getElementById("audioSentence");
    audio.play();
}