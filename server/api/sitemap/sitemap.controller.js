'use strict';

var _ = require('lodash');
var Sitemap = require('./sitemap.model');
var crawl = require('crawl');
var urlObj = require('url');

// Get list of sitemaps
exports.index = function(req, res) {
  Sitemap.find(function (err, sitemaps) {
    if(err) {  handleError(res, err); }
    res.json(sitemaps);
  });
};

// Get a single sitemap
exports.show = function(req, res) {
  console.log("_id: " + req.params.id);
  Sitemap.findById(req.params.id, function (err, sitemap) {
    if(err) {  handleError(res, err); }
    if(!sitemap) {  res.send(404); }
//    console.log(sitemap);
    res.json(sitemap);
  });
};

// Creates a new sitemap in the DB.
exports.create = function(req, res) {
  var base_url = "http://" + req.body.base_url;
  console.log('base url: ' + base_url)

  var sitemap = [];

  crawl.crawl(base_url, function(err, pages) {
    var page,
        path,
        parts,
        part,
        level;

    if (err) {
        console.error("An error occured", err);
    }

    for (var i1 = 0, l1 = pages.length; i1 < l1; i1++) {

      page = pages[i1];

      if (page.status !== 200 || page.contentType === "text/css" || page.contentType === "text/javascript" || page.contentType === "text/plain" || page.contentType === "text/plain; charset=UTF-8") {
        continue;
      }
      
      path = urlObj.parse(page.url).path;
      parts = path.split('/');
      level = 0;

      console.log('processing url', path);

      while (parts.length) {
        part = parts.shift();
        if (part && part.length) {
          console.log('processing part', part);
          if (!sitemap[level]) {
            console.log('creating new leve', level);
            sitemap[level] = [part];
          } else {
            console.log('pushing into level', level);
            if (sitemap[level].indexOf(part) < 0) {
              sitemap[level].push(part);
            }
          }
        }
        level++;
      }
    }

    console.log(sitemap);

    Sitemap.create({
      name: "New sitemap",
      base_url: base_url,
      pages: sitemap
    }, function(err, sitemap) {
      if(err) {  handleError(res, err); }
      res.json(sitemap);
    });
  });

};

// Updates an existing sitemap in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Sitemap.findById(req.params.id, function (err, sitemap) {
    if (err) {  handleError(res, err); }
    if(!sitemap) {  res.send(404); }
    var updated = _.merge(sitemap, req.body);
    updated.save(function (err) {
      if (err) {  handleError(res, err); }
       res.json(sitemap);
    });
  });
};

// Deletes a sitemap from the DB.
exports.destroy = function(req, res) {
  Sitemap.findById(req.params.id, function (err, sitemap) {
    if(err) {  handleError(res, err); }
    if(!sitemap) {  res.send(404); }
    sitemap.remove(function(err) {
      if(err) {  handleError(res, err); }
       res.send(204);
    });
  });
};

function handleError(res, err) {
   res.send(500, err);
}