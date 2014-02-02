require('./env');

var express = require('express')
    , request = require('request')
    , url = require('url')
    ;

var SHARED_SECRET = process.env['SHOPIFY_SECRET']
  , API_KEY = process.env['API_KEY'];

var app = express();

app.get('/', function(req, res) {

  var t = req.query['t'] || false
    , code = req.query['code'] || false
    , shop = req.query['shop'] || ''
    , redirectUrl
    ;

  // Going to old auth url will result in redirect to this page, but without the code or t.
  // Assumption is no code or t, = old app.
  if(false === code && false === t) {
    //@todo Make a nice page?
    res.sendfile(__dirname + '/views/please_download.html');
    return;
  }

  //Assume its old app making req against old auth.
  //This is mainly here for transition period, so we can deploy new auth code
  if(t) {
    var hash = require('crypto').createHash('md5').update(SHARED_SECRET+t).digest('hex');
    redirectUrl = 'app://index.html?p='+hash+'&shop='+shop+'&t='+t;
    res.redirect(redirectUrl);
    return;
  }

  if(!code) {
    res.send("I apologize, but there seems to be a problem. The code is missing. Restart the App, and try again. If the problem persists, please contact support.");
    console.error("query", request.query);
    return;
  }

  //And now for regular oAuth flow.
  var url = 'https://' + shop + '/admin/oauth/access_token';
  
  var qs = {
    code: code
    , client_id: API_KEY
    , client_secret: SHARED_SECRET
  };

  request.post({
    url:url
    , qs: qs
    , method: 'POST'
    , strictSSL: false
    , json: true
  }, 
  function (err, r, body) {

    if(err) {
      res.send("I apologize, but there seems to be a problem.");
      console.error(err);
      return;
    }

    //Internal app redirect.
    var access_token = body.access_token;

    redirectUrl = 'app://index.html?p='+access_token+'&shop='+shop;
    res.redirect(redirectUrl);
    return;
  });
  
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});