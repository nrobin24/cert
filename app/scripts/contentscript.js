/* jshint quotmark: false */
/* global $ */
/* global _ */
/* global Firebase */

'use strict';

var remoteResults = new Firebase('https://cert.firebaseio.com/results');
var remoteCounter = new Firebase('https://cert.firebaseio.com/counter');
var counterSnapshot;
remoteCounter.on('value', function(dataSnapshot) {
  counterSnapshot = dataSnapshot;
});

// get the list of strings from a remote resource, load them locally so they can be used for searching the DOM of amazon results pages
var searchStrings = [];
$.ajax( 'https://cert.firebaseio.com/certStrings/.json' )
  .done(function(data) {
    searchStrings = data;
});

// use jQuery to select divs that have an ID containing the string 'result_' which also have a search string
// this is specifically designed to capture search results from amazon.com, amazon uses the 'result_' as an id prefix for the divs we are targetting
var resultsContaining = function (string) {
    return $("div[id*='result_']").has("*:contains('" + string + "')");
};

// search through the DOM, find nodes specified by calling resultsContaining
var runSearch = function () {

    // get the part of the url that includes the keywords that the user searched for
    var url = $(location).attr('href');
    var urlSplit = url.split('&');
    var searchWords = _.find(urlSplit, function (frag) {
        return frag.slice(0,9) === 'keywords=';
    });
    if (!searchWords) {
        searchWords = '';
    }  else {
        // drop the 'keywords=' part of the string
        searchWords = searchWords.split(9);
    }


    var certsFound = [];
    _.each(searchStrings, function (searchString) {
        var hasResults = (resultsContaining(searchString).length > 0);
        if (hasResults){
            // log which search string yielded any results (one or many, doesn't count them any differently)
            certsFound.push(searchString);
            // paint the nodes containing the search string with a red background
            resultsContaining(searchString).css("background-color","red");

            // increment the remote counter
            if (counterSnapshot.hasChild(searchString)) {
                var counterVal = counterSnapshot.child(searchString).val();
                counterVal++;
                remoteCounter.child(searchString).set(counterVal);
            } else {
                remoteCounter.child(searchString).set(0);
            }

        }
    });
    
    // send the results up to the server id there were any certsFound
    if (certsFound.length > 0) {
        remoteResults.push({searchWords: searchWords, certsFound: certsFound, time: Firebase.ServerValue.TIMESTAMP});
    }
};

// since this can get called a lot of times really quickly, but only needs to run once a second or so, use a rate limiter
// use underscore.js rate limiter
var throttledSearch = _.throttle(runSearch, 1000, {leading: false});

// listen for any changes to the DOM, every time a change is detected run the throttledSearch function
$('body').bind('DOMSubtreeModified', throttledSearch);