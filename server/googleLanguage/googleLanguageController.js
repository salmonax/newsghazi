/*

Google Language API (Alpha)

To use, create credentials at the Google dashboard and copy them to ./googleLanguageKey.json. Guide:

http://www.programmableweb.com/news/how-to-start-using-google-cloud-natural-language-api/how-to/2016/09/01#apiu

*/

var Promise = require('bluebird');
var googleKey = require('./googleLanguageKey.json');
var language = require('@google-cloud/language');
var path = require('path');

var languageClient = language({
  projectId: googleKey.project_id,
  keyFilename: path.resolve(__dirname, 'googleLanguageKey.json')
});

var languageClient = Promise.promisifyAll(languageClient);

exports.analyzeSentiment = function (req, res, next) {
  var article = res.compoundContent['article'];
  if (article === undefined) {
    res.status(500).json({ 'error': 'Server attempted analysis on nonexistent content'})
    return;
  }
  // console.log(article);
  languageClient.detectSentiment(article, { verbose: true }, function(err, sentiment) {
      res.compoundContent = res.compoundContent || {};
      res.compoundContent['sentiment'] = sentiment;
      next();
  });
};

