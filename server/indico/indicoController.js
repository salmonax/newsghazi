/*
Indico.io API

for more information see https:https://indico.io/docs

*/

var indico = require('indico.io');
indico.apiKey = require('../keys/keylist.js').indicoKey;

module.exports.getPolitics = function(req, res, next) {
  var parameters = {};
  if (indico.apiKey) {
    indico.political(req.body.url, parameters)
    .then( (data) => {
      console.log('politics: ', data);
      res.compoundContent.politics = data;
      next();
    })
    .catch( (err) => {
      console.log(err);
    });
  }
};
