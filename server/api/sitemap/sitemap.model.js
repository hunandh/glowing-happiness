'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SitemapSchema = new Schema({
  name: String,
  base_url: String,
  root: Object, // represents the whole graph
  date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Sitemap', SitemapSchema);