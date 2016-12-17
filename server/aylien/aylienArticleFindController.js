/*
Aylien News API - related news

For more information, see: https://newsapi.aylien.com/docs/endpoints/related_stories/nodejs
*/

////// convention is to take the res object and append the new data from the middleware then either send it to the next middleware.

// user enters a url into the browser, then starts the extension.

  // the extension will then pull the url from the open tab and then send a post request to the server including that url ====>NEXT()

  // the server router will listen for the post request and upon receiving it will invoke the watsonController.getKeywords function ====>NEXT()

  // getKeywords function will pull the keywords from the article and respond with those keywords. ====>NEXT()

  // articleFinder will take the keywords response and pipe that into the aylienController, to get related articles.

  // aylienController will then ====>NEXT() back to the router so the router can send the response.



////////////////////////////////////////////////////////////

var Promise = require('bluebird');
var aylienNewsApi = require('aylien-news-api');
var aylienNonpromise = new aylienNewsApi.DefaultApi();
var aylienGoop = require('./aylien_api_key.js');


// GOOP EXAMPLE: {
//   application_id: 'YOUR_APP_ID',
//   application_key: 'YOUR_APP_KEY'
// }

// Configure API key authorization: app_id
var app_id = aylienNonpromise.apiClient.authentications['app_id'];
app_id.apiKey = aylienGoop.application_id;


// Configure API key authorization: app_key
var app_key = aylienNonpromise.apiClient.authentications['app_key'];
app_key.apiKey = aylienGoop.application_key;

var aylienArticles = Promise.promisifyAll(aylienNonpromise);

module.exports.findRelatedArticles = function(req, res, next) {

  // var keyskeys = res.compoundContent['keywords']['keywords'][0].text && res.compoundContent['keywords']['keywords'][1].text && res.compoundContent['keywords']['keywords'][2].text && res.compoundContent['keywords']['keywords'][3].text && res.compoundContent['keywords']['keywords'][4].text;

  // var topKeywords = JSON.stringify(keyskeys);

  var opts = {
    'text' : '"Hillary Clinton" AND "Donald Trump"',
    'language': ['en'],
    'publishedAtStart': 'NOW-1DAY',
    // 'sentimentBodyPolarity': 'positive',
    // 'sentimentBodyPolarity': 'negative',
    '_return': ['id', 'title', 'links'],
    'publishedAtEnd': 'NOW',
    'categoriesTaxonomy': 'iab-qag',
    'categoriesId': ['IAB17'],
    'perPage': 5
  };


  // console.log('inside opts');

  // var callback = function(error, data, response) {
  //   if (error) {
  //     console.error(error);
  //   } else {
  //     console.log(data);
  //   }
  // };
  // aylienNonpromise.listStories(opts, callback);

  if (opts) {
    aylienArticles.listStoriesAsync(opts)
    .then(relatedArticles => {
      res.compoundContent = res.compoundContent || {};

      res.compoundContent['related'] = relatedArticles;
      console.log(relatedArticles.stories[0].links);
      next();
    });
  }
};


