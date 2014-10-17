var util = require('util');
var http = require('http');
var express = require('express');
var request = require('request-promise');

var app = express();

app.set('port', process.env.PORT || 5000);

app.get('/', function(req, res) {
  res.send('OK');
});

app.get('/:channel', function(req, res) {
  var channel = req.params.channel;
  var accessTokenUrl = util.format('http://api.twitch.tv/api/channels/%s/access_token', channel);

  request(accessTokenUrl).then(function(response) {
    var accessToken = JSON.parse(response);
    var usherUrl = util.format('http://usher.twitch.tv/select/%s.json?nauthsig=%s&nauth=%s&allow_audio_only=true',
                               channel,
                               accessToken.sig,
                               accessToken.token
                              );
    return request(usherUrl);
  }, function(error) {
    res.send('No such channel');
  }).then(function(response) {
    var audioOnlyUrl = (response.match(/(http[^\s]+)\n$/) || [])[1];
    if (!audioOnlyUrl) {
      res.send('Offline');
    } else {
      res.redirect(audioOnlyUrl);
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Listening on port %d', app.get('port'));
});
