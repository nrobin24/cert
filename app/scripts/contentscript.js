/* global $ */

'use strict';

var colorResultsContaining = function (string) {
  $("div[id*='result_']").has("*:contains('" + string + "')").css("background-color","red");
}

// $.getJSON('https://cert.firebaseio.com/certStrings/.json', function (data) {
//   $.each(data.items, function (i, item) {
//     console.log(item);
//     //colorResultsContaining(thisCertString);
//   });
// });

$.ajax( 'https://cert.firebaseio.com/certStrings/.json' )
  .done(function(data) {
    $.each(data, function (i, string) {
      console.log('sup');
      console.log(string);
      colorResultsContaining(string);
    });
  });


