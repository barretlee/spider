'use strict';

var OPEN_ARTICLE = true;
var OPEN_IMG = true;
var OPEN_VIDEO = true;

var config = {
  // 爬虫网站根目录
  url: 'http://www.example.com/',
  // 是否爬取文章
  open_article: OPEN_ARTICLE,
  // 是否爬取图片
  open_img: OPEN_IMG,
  // 是否爬取视频
  open_video: OPEN_VIDEO,
  // 储存根目录
  rootDir: 'pool',
  // 文章储存根目录
  textDir: 'articles',
  // 图片储存根目录
  imgDir: 'images',
  // 视频储存根目录
  videoDir: 'videos',
  // 获取（文）文件夹名字
  is_text_type: function(dir) {
    return dir.indexOf(config.textDir) > -1;
  },
  // 获取（图）文件夹名字
  is_img_type: function(dir) {
    return dir.indexOf(config.imgDir) > -1;
  },
  // 获取（视频）文件夹名字
  is_video_type: function(dir) {
    return dir.indexOf(config.videoDir) > -1;
  },
  // 主类目 class，主文件路径
  menu_box: '.navc,.navd',
  // 获取主类目（图+文+视频）文件夹名字
  title_detection: function(index) {
    return index === 0;
  },
  // 子类目 class，子文件路径
  menu_item: 'a',
  // 获取单个子类目总页码数
  get_total_num: function($) {
    return +$('.pagination22').text().match(/\/(\d+)/)[1];
  },
  // 获取单个子类目列表页的地址
  // 该爬虫只适用于有规律的 URL
  get_url: function(url, num) {
    return url + 'index-' + num + '.html';
  },
  // 获取每页列表中所有的 url 地址
  content_url_match: '.zuo a[href^="/art"]',
  // 文本页获取内容
  content_match: '.content',
  // 文本页获取标题
  title_match: '.page_title',
  // 图片页标题
  img_title_match: '.page_title',
  // 图片页内容
  img_content_match: '.content img',
  // 文章样式
  article_style: '<style>.body{-webkit-tap-highlight-color:transparent;font-size:16px;color:#2f2f2f;background:#fff;font-family:Georgia,serif;}.content{padding:20px 5%;max-width:700px;margin:0 auto;line-height:1.5}h2{line-height:50px;font-size:24px;}</style>',
  // 保存文件名处理，过滤非法字符
  file_name_reg: /[\*\&\\\/\?\|\:\<\>\n\.\ "'\,\£¨\£©]/gim
};

module.exports = config;
