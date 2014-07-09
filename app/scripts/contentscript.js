/* jshint quotmark: false */
/* global $ */
/* global _ */

'use strict';

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
    console.log('searching');
    var searchResults = [];
    _.each(searchStrings, function (searchString) {
        var hasResults = (resultsContaining(searchString).length > 0);
        if (hasResults){
            // log which search string yielded any results (one or many, doesn't count them any differently)
            searchResults.push(searchString);
            // paint the nodes containing the search string with a red background
            resultsContaining(searchString).css("background-color","red");
        }
    });
    console.log(searchResults);
};

// since this can get called a lot of times really quickly, but only needs to run once a second or so, use a rate limiter
// use underscore.js rate limiter
var throttledSearch = _.throttle(runSearch, 1000);

// listen for any changes to the DOM, every time a change is detected run the throttledSearch function
$('body').bind('DOMSubtreeModified', throttledSearch);