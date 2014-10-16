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
  crawl.crawl(base_url, function(err, pages) {
    if (err) {
        console.error("An error occured", err);
    }

    var nested_pages = {};

    function save(parts) {
      if (parts.length === 1) {
        // save to array
        console.log(parts);
      } else {
        parts.shift();
        save(parts);
      }
    }

    function createSitemap(path) {
      var parts = path.split('/'),
          rest = path.replace(parts[0] + '/', '');
          
      parts.shift();
      console.log(parts)
      // save
      //save(parts);
/*
      if (isDefined(sitemap.urls[parts[0]])) {
        sitemap.urls[parts[0]].push(rest);
      } else {
        sitemap.urls[parts[0]] = [];
      }
      rest && createSitemap(rest);
      */
    }


    for (var num in pages){
      var page = pages[num],
          path;
      if (page.contentType !== 'text/html; charset=utf-8' || page.status !== 200) {
        continue;
      }

      path = urlObj.parse(page.url).path;
      //console.log(path);
      createSitemap(path);
    }


    
    Sitemap.create({
      name: "New sitemap",
      base_url: base_url,
      pages: pages
    }, function(err, sitemap) {
      if(err) {  handleError(res, err); }
      console.log("ready to client")
      res.json(sitemap)

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