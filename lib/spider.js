'use strict';

var cluster = require('cluster');

var Master = require('./master');
var Workers = require('./workers');

if (cluster.isMaster) {
  Master.analysis().then(function(cates) {
    Master.distrubute(cates, cluster);
  });
} else {
  Workers.listening(cluster);
}
