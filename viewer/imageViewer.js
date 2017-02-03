var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var config = require('../config');

var root = path.join(__dirname, '../', config.rootDir, config.imgDir);
var style = "<style>a{line-height: 22px; text-decoration: none;}</style>";
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

app.get('/:cate/:dir', function(req, res) {
  var cate = decodeURIComponent(req.params.cate);
  var dir = decodeURIComponent(req.params.dir);
  var dirs = fs.readdirSync(path.join(root, cate, dir));
  var str = dirs.map(function(item) {
    return "<img src='" + dir + "/" + item + "' />"
  });
  res.send("<style>img {max-width: 100%;display:block;margin:0 auto;}</style>" + str.join("<br>"));
});

app.get('/:cate/:dir/:img', function(req, res) {
  var cate = decodeURIComponent(req.params.cate);
  var dir = decodeURIComponent(req.params.dir);
  var img = decodeURIComponent(req.params.img);
  var file = fs.readFileSync(path.join(root, cate, dir, img), 'binary');
  res.writeHead('200', {'Content-Type': 'image/jpeg'});    //写http头部信息
  res.end(file, 'binary');
});


app.get('*', function(req, res) {
  res.status(404).end();
});


app.listen(8787, function() {
  console.log("open: http://localhost:8787");
});
