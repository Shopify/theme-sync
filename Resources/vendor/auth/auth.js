var express = require('express')
    , url = require('url')
    , crypto = require('crypto')
    ;

var SHARED_SECRET = 'app-shared-secret-key';

var app = express.createServer(express.logger());

app.get('/', function(request, response) {

  var t = request.query['t'] || false
      , shop = request.query['shop'] || ''
      ;

  if(false === t) {
      response.send('No token. Redirecting');
      return;
  }

  var hash = require('crypto').createHash('md5').update(SHARED_SECRET+request.query['t']).digest('hex');

  //Pass t for backwards compat - this way things should still work for apps with the shared key in it.
  var redirectUrl = 'app://index.html?p='+hash+'&shop='+shop+'&t='+t;
  response.redirect(redirectUrl);
  return;

});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
