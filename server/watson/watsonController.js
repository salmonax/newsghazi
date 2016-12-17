/*
Alchemy Language API

for more information see https://www.ibm.com/watson/developercloud/alchemy-language/api/v1/?node

*/
var watson = require('watson-developer-cloud');
var keylist = require('../keys/keylist.js');
var alchemy_language = watson.alchemy_language({
  api_key: keylist.watsonKey
});
var alchemy_data_news = watson.alchemy_data_news({
  api_key: keylist.watsonKey
});


module.exports.getEmotions = function(req, res, next) {
  // No error checking if first in chain; assumes url already set
  var params = {
    url: res.compoundContent.url
  };
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
      // console.log(res.compoundContent, 'in get title');
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
      res.compoundContent['keywords'] = response.keywords;
      // console.log(res.compoundContent, 'inside get keywords!');
    }
    next();
  });
};

module.exports.getEntities = function(req, res, next) {
  var parameters = {
    url: req.body.url,
    maxRetrieve: 5,
    // sourceText: 'cleaned_or_raw'

  };

  alchemy_language.entities(parameters, function (err, response) {
    if (err) {
      console.log('error:', err);
    } else {
      res.compoundContent = res.compoundContent || {};
      res.compoundContent['entities'] = response.entities;
      // console.log(res.compoundContent['entities'], 'inside entities!');

    }
    next();
  });
};


module.exports.getRelated = function(req, res, next) {
  console.log('inside get related');
  var params = {
    start: 'now-1M',
    end: 'now',
    count: 5,
    return: 'enriched.url.title'
  };

  alchemy_data_news.getNews(params, function (err, response) {
    if (err) {
      console.log('error:', err);
    } else {
      console.log('inside getnews');
      res.compoundContent = res.compoundContent || {};
      res.compoundContent['relatedArticles'] = response;
      console.log('gotpast res');

    }
    next();
  });
};
