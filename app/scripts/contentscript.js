/* global $ */

'use strict';

var colorResultsContaining = function (string) {
  $("div[id*='result_']").has("*:contains('" + string + "')").css("background-color","red");
}

$.ajax( 'https://cert.firebaseio.com/certStrings/.json' )
  .done(function(data) {
    $.each(data, function (i, string) {
      colorResultsContaining(string);
    });
  });
