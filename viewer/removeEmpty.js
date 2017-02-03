var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var config = require('../config');

var root = path.join(__dirname, '../', config.rootDir, config.imgDir);
var imgs = fs.readdirSync(root);

imgs.forEach(function(file) {
  var base = path.join('../pool/' + config.imgDir, file);
  var cate = fs.readdirSync(base);
  cate.forEach(function(c) {
    var p = path.join(base, c);
    var files = fs.readdirSync(p);
    if (!files.length) {
      try {
        fs.unlink(p);
      } catch (e) {
        exec('rm -rf ' + p)
      }
      console.log(p);
      // exec('rm -rf ' + p);
    }
    // !fs.readdirSync(p).length && fs.unlinkSync(p);
  });
});


process.on('uncaughtException', function(err) {
  //打印出错误
  console.log(err);
});
