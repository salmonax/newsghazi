//var nodeUrlExpand = require('node-url-expand');
var http = require('http');
var url = require('url');

var urlExpander = function (shorturl, cb) {

  var parseUrl = url.parse(shorturl);

  return http.get({
    host: parseUrl.host,
    path: parseUrl.pathname
  }, function(response) {

    var output = response.headers;

    // explicitly treat incoming data as utf8 (avoids issues with multi-byte chars)
    response.setEncoding('utf8');

    // incrementally capture the incoming response body
    var body = '';
    response.on('data', function(d) {
        body += d;
    });

    response.on('end', function() {

      try {
        var outputUrl = url.parse(output.location);
        console.log(JSON.stringify(outputUrl));
      } catch (err) {
        return cb(err);
      }

      // pass the relevant data back to the callback
      cb(null, outputUrl.protocol + '//' + outputUrl.host + outputUrl.path);

    });

  }).on('error', function(err) {
    cb(err);
  });
}

module.exports = {
  expandURL: function (req, res, next) {
    if (req.body.url) {
      console.log('\n\n\n --- ENTERING URL EXPANDER ---- \n\n\n');
      urlExpander(req.body.url, function (err, url) {
        if (err) {
          console.log('Error expanding:' + req.body.url);
        } else {
          console.log('"' + req.body.url + '"' + ' expanded to: ' + url);
          req.body.url = url;
        }
        console.log('\n\n\n --- EXITING URL EXPANDER ---- \n\n\n');
        next();
      });
    }
  }
};
