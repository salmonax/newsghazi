/*
Aylien Text API

For more information, see: The Website
*/

var Promise = require('bluebird');
var aylien = require('aylien_textapi');
var aylienGoop = require('./aylien_api_key.js');
var aylienBabby = new aylien(aylienGoop);

module.exports = Promise.promisifyAll(aylienBabby);
