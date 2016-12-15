/*
Aylien Text API

For more information, see: Teh Website
*/

var Promise = require('bluebird');
var aylien = require('aylien_textapi');
var aylienGoop = require('./aylien_api_key.js');
var aylienBabby = new aylien(aylienGoop);

var aylienAPI = Promise.promisifyAll(aylienBabby);

exports.extractArticle = function (req, res, next) {
  if (req.body.url) {
    aylienAPI.extractAsync({
      url: req.body.url,
      best_image: false
    }).then(content => {
      res.compoundContent = res.compoundContent || {};
      res.compoundContent['article'] = content.article;
      next();
    });
  }
};
