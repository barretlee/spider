var request = require('request');

var url = 'http://www.cnblogs.com/pick/';

request({
  url: url,
  timeout: 5E3,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    Referer: url
  }
}, function(err, res, body) {
  if (err || !body) {
    return console.log(err);
  }
  console.log(body.toString());
});