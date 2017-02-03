'use strict';

var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var request = require('request');

var config = require('../config');

var numCPUs = require('os').cpus().length;
var catesQueue = [];
var subCateQueue = [];

var Master = {};

// master 主程序分析主页，然后执行 distrubute 分配任务给 workers
Master.analysis = function() {

  return new Promise(function(resolve, reject) {
    request({
      url: config.url,
      timeout: 8E3
    }, function(err, res, body) {
      if (err) {
        return reject(err);
      }
      resolve(body);
    });
  }).then(function(data) {

    var $ = cheerio.load(data, {
      normalizeWhitespace: false,
      decodeEntities: false
    });
    var cates = {};
    $(config.menu_box).each(function() {
      var cate;
      var subCate = {};
      var links = $(this).find(config.menu_item);
      if (links.length) {
        links.each(function(index) {
          var text = $(this).text();
          var href = $(this).attr('href');
          if (config.title_detection(index)) {
            cate = text;
            return;
          }
          if (href && href.indexOf('/') > -1) {
            subCate[text] = href.indexOf('//') > -1 ? href : config.url + href;
            subCate[text] = subCate[text].replace(/([^:])\/\//g, '$1/');
          }
        });
        if (cate) {
          cates[cate] = subCate;
        }
      }
    });
    console.log("Start Spider Man", JSON.stringify(cates, null, 2));
    return cates;
  }).catch(function(e) {

    console.log(e);
  });
};

// master 分配任务
Master.distrubute = function(cates, cluster) {

  Object.keys(cates).forEach(function(cate) {
    Object.keys(cates[cate]).forEach(function(subCate) {
      catesQueue.push({
        dir: path.join(config.rootDir, cate, subCate),
        url: cates[cate][subCate],
        type: "list"
      });
    });
  });

  while (numCPUs--) {
    var c = cluster.fork();
    if (catesQueue.length) {
      c.send(catesQueue.shift());
      c.on("message", function(msg) {
        if (typeof msg === "object") {
          if (msg.type == "list") {
            subCateQueue.push(msg);
          }
          if (catesQueue.length) {
            c.send(catesQueue.shift());
          } else if (subCateQueue.length) {
            var list = subCateQueue.shift();
            list.type = config.is_text_type(list.dir)
              ? 'articles' : config.is_img_type(list.dir)
              ? 'imgs' : config.is_video_type(list.dir)
              ? 'videos' : '';
            if (list.type === 'articles' && config.open_article ||
                list.type === 'imgs' && config.open_img ||
                list.type === 'videos' && config.open_video) {
              c.send(list);
            }
          } else {
            console.log(msg.dir + ' done.');
          }
        } else {
          console.log(msg);
        }
      });
    }
  }
};

module.exports = Master;
