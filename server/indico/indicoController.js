/*
Indico.io API

for more information see https:https://indico.io/docs

*/

var indico = require('indico.io');
indico.apiKey = require('./indico_api_key.js').apiKey;


module.exports.getPolitics = function(req, res, next) {
  var parameters = {};

  indico.political(req.body.url, parameters)
    .then( (data) => {
      console.log('politics: ', data);
      res.compoundContent.politics = data;
      next();
    })
    .catch( (err) => {
      console.log(err);
    });
};
