var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var config = require('../config');

var style = "<style>a{line-height: 22px; text-decoration: none;}</style>";
var root = path.join(__dirname, '../', config.rootDir, config.textDir);
app.get('/', function(req, res) {
  var dirs = fs.readdirSync(root);
  var str = dirs.map(function(item) {
    return "<a href='/" + item + "'>" + item + "</a>";
  });
  res.send(style + str.join("<br>"));
});

app.get('/:cate', function(req, res) {
  var cate = decodeURIComponent(req.params.cate);
  var dirs = fs.readdirSync(path.join(root, cate));
  var str = dirs.map(function(item) {
    return "<a href='/" + cate + "/" + item + "'>" + cate + "/" + item + "</a>";
  });
  res.send(style + str.join("<br>"));
});

app.get('/:cate/:file', function(req, res) {
  var cate = decodeURIComponent(req.params.cate);
  var file = decodeURIComponent(req.params.file);
  var f = "<meta charset='utf-8'>" + fs.readFileSync(path.join(root, cate, file), 'utf-8').toString();
  res.writeHead('200', {'Content-Type': 'text/html; charset=utf-8'});    //写http头部信息
  res.end(f);
});

app.get('*', function(req, res) {
  res.status(404).end();
});


app.listen(8786, function() {
  console.log("open: http://localhost:8786");
});
