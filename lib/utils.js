'use strict';

var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var request = require('request');

var config = require('../config');
var Utils = {};

// 获取一个子目录下的所有分页地址
Utils.fetchSubCatePagesNum = function(url) {
  return new Promise(function(resolve, reject) {
    // process.send("GET Sub Cate: " + url);
    request({
      url: url,
      timeout: 8E3
    }, function(err, res, body) {
      if (err) {
        console.log(err);
        return resolve();
      }
      resolve(cheerio.load(body, {
        normalizeWhitespace: false,
        decodeEntities: false
      }));
    });
  }).then(function($) {
    if (!$ || !$.html()) {
      return [];
    }
    var num = config.get_total_num($);
    console.log('Total: ' + num + ' Pages ( ' + url + ' )');
    var ret = [];
    while (num--) {
      ret.push(config.get_url(url, num));
    }
    return ret;
  }).catch(function(err) {
    console.log(err);
  });
};

// 获取单个子目录一页中 url 地址列表
Utils.fetchSubCateOnePageUrls = function(msg) {
  return !msg.subCatePages.length ? Promise.resolve()
    : new Promise(function(resolve, reject) {
    var url = msg.subCatePages.shift();
    process.send("fetchSubCateOnePageUrls Process: " + url + ", type: " + msg.type);
    request({
      url: url,
      timeout: 5E3
    }, function(err, res, body) {
      if (err || !body) {
        return resolve();
      }
      resolve(cheerio.load(body, {
        normalizeWhitespace: false,
        decodeEntities: false
      }));
    });
  }).then(function($) {
    if (!$ || !$.html()) {
      return Utils.fetchSubCateOnePageUrls(msg);
    }
    var details = [];
    $(config.content_url_match).each(function() {
      details.push(config.url + $(this).attr("href"));
    });
    return Utils.contentAnalysisPerPage(details, msg).then(function(msg) {
      Utils.fetchSubCateOnePageUrls(msg);
    });
  }).catch(function() {
    return Utils.fetchSubCateOnePageUrls(msg);
  });
};

// 内容分析
Utils.contentAnalysisPerPage = function(queue, msg) {
  console.log("\n" + queue.length + "\n");
  return !queue.length ? Promise.resolve(msg)
    : new Promise(function(resolve, reject) {
    var url = queue.shift();
    process.send("contentAnalysisPerPage Process: " + url + ", type: " + msg.type);
    request({
      url: url,
      timeout: 5E3
    }, function(err, res, body) {
      if (err || !body) {
        resolve();
        return
      }
      resolve(cheerio.load(body, {
        normalizeWhitespace: false,
        decodeEntities: false
      }));
    });
  }).then(function($) {
    if (!$ || !$.html()) {
      return Utils.contentAnalysisPerPage(queue, msg);
    }
    if (msg.type === 'articles') {
      return Utils.fetchArticle($, msg).then(function() {
        Utils.contentAnalysisPerPage(queue, msg);
      });
    } else if (msg.type === 'imgs') {
      return Utils.fetchImages($, msg).then(function() {
        Utils.contentAnalysisPerPage(queue, msg);
      });
    } else if (msg.type === 'videos') {
      Utils.fetchVideo();
    }
  }).catch(function() {
    return Promise.resolve(msg);
  });
};

// 获取单页文章内容
Utils.fetchArticle = function($, msg) {
  return new Promise(function(resolve, reject) {
    var ctt = $(config.content_match).html();
    var title = $(config.title_match).text();
    if (ctt) {
      ctt = config.article_style + "<div class='content'><h2>" + title + "</h2>" + ctt + "</div>";
    }
    var file = path.join(msg.dir, title.replace(config.file_name_reg, "").toString() + ".html");
    console.log('File Path: ' + file);
    fs.writeFileSync(file, ctt, 'utf8');

    resolve();
  }).catch(function() {
    return Promise.resolve();
  })
};

// 分析页面图片信息, 进行抓取
Utils.fetchImages = function($, msg) {
  var pics = [];
  var title = $(config.img_title_match).text();
  var dir = path.join(msg.dir, title.replace(config.file_name_reg, "").toString());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  } else {
    if (!fs.readdirSync(dir).length) {
      fs.unlinkSync(dir);
    }
    return Promise.resolve();
  }
  $(config.img_content_match).each(function() {
    var src = $(this).attr("src");
    if (src && (pics.indexOf(src) == -1)) {
      var file = path.join(dir, src.slice(src.lastIndexOf("/") + 1));
      pics.push({
        file: file,
        src: src
      });
    }
  });
  return Utils._fetchImages(pics);
};

// 获取单页所有图片
Utils._fetchImages = function(pics) {
  return !pics.length ? Promise.resolve()
    : new Promise(function(resolve, reject) {
    var item = pics.shift();
    process.send("fetchImage Process: " + item.src + ", \nfile: " + item.file);
    request({
      url: item.src,
      timeout: 5E3,
      encoding: 'binary'
    }, function(err, res, body) {
      if (err || !body) {
        resolve();
        return
      }
      item.body = body;
      resolve(item);
    });
  }).then(function(item) {
    if (!item) {
      return Utils._fetchImages(pics);
    }
    fs.writeFileSync(item.file, item.body, 'binary');
    return Utils._fetchImages(pics);
  }).catch(function() {
    return Utils._fetchImages(pics);
  });
};


// 获取单页的视频
Utils.fetchVideo = function() {
  // console.log('videos');
};

module.exports = Utils;
