/*
Alchemy Language API

for more information see https://www.ibm.com/watson/developercloud/alchemy-language/api/v1/?node

*/
var watson = require('watson-developer-cloud');
var watsonKey = require('./watson_api_key.js');
var alchemy_language = watson.alchemy_language({
  api_key: watsonKey.watsonKey
});
var alchemy_data_news = watson.alchemy_data_news({
  api_key: watsonKey.watsonKey
});


module.exports.getEmotions = function(req, res, next) {
  // No error checking if first in chain; assumes url already set
  var params = {
    url: res.compoundContent.url
  }
  alchemy_language.emotion(params, function (err, response) {
    if (err)
      console.log('error:', err);
    else
      res.compoundContent = res.compoundContent || {};
      res.compoundContent['emotion'] = response;
      // console.log(JSON.stringify(response, null, 2));
      next();
  });
};

module.exports.getTitle = function(req, res, next) {
  // console.log('request body', req.body.url);
  var parameters = {
    url: req.body.url
  };

  alchemy_language.title(parameters, function (err, response) {
    if (err) {
      console.log('error:', err);
    } else {
      // console.log(JSON.stringify(response, null, 2));
      res.compoundContent = res.compoundContent || {};
      res.compoundContent['title'] = response;
      next();
    }
  });
};

module.exports.getKeywords = function(req, res, next) {
  var parameters = {
    url: req.body.url,
    maxRetrieve: 5
  };

  alchemy_language.keywords(parameters, function (err, response) {
    if (err) {
      console.log('error:', err);
    } else {
      res.compoundContent = res.compoundContent || {};
      res.compoundContent['keywords'] = response;
      // console.log(JSON.stringify(res.compoundContent));
    }
    next();
  });
};

module.exports.getEntities = function(req, res, next) {
  var parameters = {
    url: req.body.url,
    maxRetrieve: 5,
    sourceText: 'cleaned_or_raw'
  };

  alchemy_language.entities(parameters, function (err, response) {
    if (err) {
      console.log('error:', err);
    } else {
      res.compoundContent = res.compoundContent || {};
      res.compoundContent['entities'] = response;
      console.log(JSON.stringify(res.compoundContent));
    }
    next();
  });
};


module.exports.getRelated = function(req, res, next) {

  var params = {
    start: 'now-1M',
    end: 'now',
    count: 5,
    return: 'enriched.url.title'
    // adjust search
  };

  alchemy_data_news.getNews(params, function (err, news) {
    if (err) {
      console.log('error:', err);
    } else {
      res.compoundContent = res.compoundContent || {};
      res.compoundContent['relatedArticles'] = response;
      console.log(JSON.stringify(news, null, 2));
    }
    next();
  });
};
