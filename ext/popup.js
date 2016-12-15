// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */


function getCurrentTabUrl(callback) { 
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
};


//scrapper for content
const contentScrapper = function() {
  return $('p').toArray().map(p => p.innerText).join(' ');
};

//assumptions:
//1 - all the content is in paragraphs
//2 - paragraph elements have no incomplete sentences (a sentence can not be in two paragrahs)

//interface: string | regex, string, string
//Ex: first argument could be /\d+/ for testing numbers. 

//parerga: textContent or innerText ? 

const styleStringInContent = function(str, cssProperty, cssValue) {
  const beginMarker = '~';
  const endMarker ='`';

  //mark text and inject html tags:
  const markerFunction = function(tag, str, startIndex) {   
    tag.textContent = tag.textContent.slice(0,startIndex) +
    beginMarker + str + endMarker + tag.textContent.slice(startIndex + str.length);
  };

  //process the content:
  $('p').toArray().forEach((paragraph, i) => {
    // if(i === 5) {debugger;}
    var text = paragraph.textContent;    
    if(typeof str ==='string') {
      var startIndex = text.indexOf(str);
      if(startIndex !== -1) {
        markerFunction(paragraph, str, startIndex);
      }
    } else {
      var facts = text.split('.').filter(sentence => str.test(sentence));
      facts.forEach(fact => markerFunction(paragraph, fact, paragraph.textContent.indexOf(fact)));
    }
    //inject html to the paragraph:
    var htmlElementToInjectBegin = '<span class="highlightItem">';
    var htmlElementToInjectEnd = '</span>';
    paragraph.innerHTML = paragraph.innerHTML.replace(/~/gi, htmlElementToInjectBegin);
    paragraph.innerHTML = paragraph.innerHTML.replace(/`/gi, htmlElementToInjectEnd); 
  });
  $('.highlightItem').css(cssProperty,cssValue);
};

//OLD:
// const styleStringInContent = function(str, cssProperty, cssValue) {
//   const marker = '^';

//   //mark text and inject html tags:
//   var markerFunction = function(tag, str, startIndex) {
//     var htmlElementToInjectBegin = '<span class="highlightItem">';
//     var htmlElementToInjectEnd = '</span>';
//     tag.textContent = tag.textContent.slice(0,startIndex) +
//     marker + str + marker + tag.textContent.slice(startIndex + str.length);
//     tag.innerHTML = tag.innerHTML.replace('^', htmlElementToInjectBegin);
//     tag.innerHTML = tag.innerHTML.replace('^', htmlElementToInjectEnd);
//   };

//   //process the content:
//   $('p').toArray().forEach((paragraph, i) => {
//     // if(i === 5) {debugger;}
//     var text = paragraph.textContent;    
//     if(typeof str ==='string') {
//       var startIndex = text.indexOf(str);
//       if(startIndex !== -1) {
//         markerFunction(paragraph, str, startIndex);
//       }
//     } else {
//       var facts = text.split('.').filter(sentence => str.test(sentence));
//       facts.forEach(fact => markerFunction(paragraph, fact, paragraph.textContent.indexOf(fact)));
//     }
//   });
//   $('.highlightItem').css(cssProperty,cssValue);
// };





getCurrentTabUrl(function(tabUrl) {
  var urlData = $.ajax({
    url: 'http://localhost:8000/api/ext',
    type: 'POST',
    data: {'url': tabUrl},
    dataType: 'json'
  })
  .done(function (json) {
    console.log(json);
    var rating = '';
    if ((json.fake.rating.score + '') === '0') {
      rating = 'This page does not exist in our Fake News blacklist.';
    } else if ((json.fake.rating.score + '') === '100') {
      rating = 'WARNING: This page is hosted on a domain that has been blacklisted because of fake news.';
    }
    $("<h1>").text(rating).appendTo('body');
  })
  .fail(function( xhr, status, errorThrown ) {
    console.log( "Error: " + errorThrown );
    console.log( "Status: " + status );
    console.dir( xhr );
  });
});


//   // Most methods of the Chrome extension APIs are asynchronous. This means that
//   // you CANNOT do something like this:
//   //
//   // var url;
//   // chrome.tabs.query(queryInfo, function(tabs) {
//   //   url = tabs[0].url;
//   // });
//   // alert(url); // Shows "undefined", because chrome.tabs.query is async.
// }

// /**
//  * @param {string} searchTerm - Search term for Google Image search.
//  * @param {function(string,number,number)} callback - Called when an image has
//  *   been found. The callback gets the URL, width and height of the image.
//  * @param {function(string)} errorCallback - Called when the image is not found.
//  *   The callback gets a string that describes the failure reason.
//  */
// function getImageUrl(searchTerm, callback, errorCallback) {
//   // Google image search - 100 searches per day.
//   // https://developers.google.com/image-search/
//   var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/images' +
//     '?v=1.0&q=' + encodeURIComponent(searchTerm);
//   var x = new XMLHttpRequest();
//   x.open('GET', searchUrl);
//   // The Google image search API responds with JSON, so let Chrome parse it.
//   x.responseType = 'json';
//   x.onload = function() {
//     // Parse and process the response from Google Image Search.
//     var response = x.response;
//     if (!response || !response.responseData || !response.responseData.results ||
//         response.responseData.results.length === 0) {
//       errorCallback('No response from Google Image search!');
//       return;
//     }
//     var firstResult = response.responseData.results[0];
//     // Take the thumbnail instead of the full image to get an approximately
//     // consistent image size.
//     var imageUrl = firstResult.tbUrl;
//     var width = parseInt(firstResult.tbWidth);
//     var height = parseInt(firstResult.tbHeight);
//     console.assert(
//         typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
//         'Unexpected respose from the Google Image Search API!');
//     callback(imageUrl, width, height);
//   };
//   x.onerror = function() {
//     errorCallback('Network error.');
//   };
//   x.send();
// }

// function renderStatus(statusText) {
//   document.getElementById('status').textContent = statusText;
// }

// document.addEventListener('DOMContentLoaded', function() {
//   getCurrentTabUrl(function(url) {
//     // Put the image URL in Google search.
//     renderStatus('Performing Google Image search for ' + url);

//     getImageUrl(url, function(imageUrl, width, height) {

//       renderStatus('Search term: ' + url + '\n' +
//           'Google image search result: ' + imageUrl);
//       var imageResult = document.getElementById('image-result');
//       // Explicitly set the width/height to minimize the number of reflows. For
//       // a single image, this does not matter, but if you're going to embed
//       // multiple external images in your page, then the absence of width/height
//       // attributes causes the popup to resize multiple times.
//       imageResult.width = width;
//       imageResult.height = height;
//       imageResult.src = imageUrl;
//       imageResult.hidden = false;

//     }, function(errorMessage) {
//       renderStatus('Cannot display image. ' + errorMessage);
//     });
//   });
// });
