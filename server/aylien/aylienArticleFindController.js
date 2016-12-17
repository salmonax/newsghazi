/*
Aylien News API - related news

For more information, see: https://newsapi.aylien.com/docs/endpoints/related_stories/nodejs
*/


var Promise = require('bluebird');
var aylienNewsApi = require('aylien-news-api');
var aylienNonpromise = new aylienNewsApi.DefaultApi();
var aylienGoop = require('./aylien_api_key.js');


// GOOP EXAMPLE: {
//   application_id: 'YOUR_APP_ID',
//   application_key: 'YOUR_APP_KEY'
// }

// var AylienNewsApi = require('aylien-news-api');

// var apiInstance = new AylienNewsApi.DefaultApi();

// // Configure API key authorization: app_id
// var app_id = apiInstance.apiClient.authentications['app_id'];
// app_id.apiKey = "2f12908b";

// // Configure API key authorization: app_key
// var app_key = apiInstance.apiClient.authentications['app_key'];
// app_key.apiKey = "fc69a483ca778bb43c34f8a8e78b89c1";




// Configure API key authorization: app_id
var app_id = aylienNonpromise.apiClient.authentications['app_id'];
app_id.apiKey = aylienGoop.application_id;


// Configure API key authorization: app_key
var app_key = aylienNonpromise.apiClient.authentications['app_key'];
app_key.apiKey = aylienGoop.application_key;

var aylienArticles = Promise.promisifyAll(aylienNonpromise);

////// convention is to take the res object and append the new data from the middleware then either send it to the next middleware.

// user enters a url into the browser, then starts the extension.

  // the extension will then pull the url from the open tab and then send a post request to the server including that url ====>NEXT()

  // the server router will listen for the post request and upon receiving it will invoke the watsonController.getKeywords function ====>NEXT()

  // getKeywords function will pull the keywords from the article and respond with those keywords. ====>NEXT()

  // articleFinder will take the keywords response and pipe that into the aylienController, to get related articles.

  // aylienController will then ====>NEXT() back to the router so the router can send the response.


exports.findRelatedArticles = function(req, res, next) {

  var topKeywords = res.compoundContent['keywords']['keywords'][0].text && res.compoundContent['keywords']['keywords'][1].text && res.compoundContent['keywords']['keywords'][2].text && res.compoundContent['keywords']['keywords'][3].text && res.compoundContent['keywords']['keywords'][4].text;

  var opts = {
    'text': 'trump',
    // 'language': ['en'],
    // '_return': ['id', 'title', 'body'],
    // 'storyLanguage': 'en',
    'perPage': 5
  };

  if (topKeywords) {
    aylienArticles.listRelatedStoriesAsync(opts)
    .then(relatedArticles => {
      res.compoundContent = res.compoundContent || {};
      res.compoundContent['related'] = relatedArticles;
      next();
    });
  }

  // if (!res.compoundContent.keywords) {
  //   console.error('Entities do not exist within compoundContent');
  // } else {
  //   aylienArticles.listRelatedStories(opts, function(error, data, response) {
  //     if (error) {
  //       console.error(error, 'error inside aylienArticles => listRelatedStories');
  //     } else {
  //       console.log('API called successfully. Returned data: ' + JSON.stringify(data));
  //       res.compoundContent['articles'] = data;
  //     }
  //     console.log(res.compoundContent['articles'], 'added to res content');
  //   });

  // }
  // next();




  // var optsEEENNNTTT = {
  //   // 'title': req.body.keywords, //KEYWORD HERE
  //   // 'body': req.body.keywords[0] //KEYWORD HERE
  //   'text': res.compoundContent['entities']['entities'][0],
  //   'language': ['en'],
  //   // 'entitiesTitleText': ['GNU/Linux'],
  //   // 'entitiesTitleType': ['Software'],
  //   // 'sentimentBodyPolarity': 'positive',
  //   // 'cluster': false,
  //   // 'clusterAlgorithm': 'lingo',
  //   '_return': ['id', 'title', 'body'],
  //   // 'boostBy': 'popularity',
  //   // 'sourceLinksInCountMin': 100000,
  //   'storyLanguage': 'en',
  //   'perPage': 5
  // };

  // var optsPos = {
  //   'text': topKeywords,
  //   'language': ['en'],
  //   'sentimentBodyPolarity': 'positive',
  //   '_return': ['id', 'title', 'body'],
  //   'storyLanguage': 'en',
  //   'perPage': 3
  // };

  // var optsNeg = {
  //   'text': topKeywords,
  //   'language': ['en'],
  //   'sentimentBodyPolarity': 'negative',
  //   '_return': ['id', 'title', 'body'],
  //   'storyLanguage': 'en',
  //   'perPage': 3
  // };

  // if (!res.compoundContent.entities) {
  //   console.error('Entities do not exist within compoundContent');
  // } else {
  //   aylienArticles.listRelatedStories(opts, function(error, data, response) {
  //     if (error) {
  //       console.error(error, 'error inside aylienArticles => listRelatedStories');
  //     } else {
  //       console.log('API called successfully. Returned data: ' + JSON.stringify(data));
  //       res.compoundContent['articles'] = data;
  //     }
  //     // console.log(res.compoundContent['articles'], 'added to res content');
  //     next();
  //   });
  // }
};


