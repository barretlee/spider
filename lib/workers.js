'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');

var Utils = require('./utils');
var config = require('../config');

var Workers = {};

// 子进程监听任务分发
Workers.listening = function() {
  process.on('message', function(msg) {
    var type = msg.type;
    var url = msg.url;

    switch (type) {
      case 'list':
        Utils.fetchSubCatePagesNum(url).then(function(data) {
          msg.subCatePages = data;
          process.send(msg);
        });
        break;
      case 'articles':
      case 'imgs':
      case 'videos':
        Workers.fetchSubCate(msg);
        break;
      default:
        process.send(msg);
    }
  });
};

// 执行一个子目录的下载任务
Workers.fetchSubCate = function(msg) {
  var dir = msg.dir;
  if (!fs.existsSync(dir)) mkdirp.sync(dir);
  if (msg.subCatePages && msg.subCatePages.length) {
    Utils.fetchSubCateOnePageUrls(msg).then(function() {
      process.send("\n\n" + dir + " OVER\n\n");
    });
  } else {
    process.send("\n\n" + dir + " OVER\n\n");
  }
};


module.exports = Workers;
