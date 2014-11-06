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

  var resultArray = [];
  var baseArray = [];

  crawl.crawl(base_url, function(err, pages) {
    if (err) {
        console.error("An error occured", err);
    }

    
    var node = function(parentName, name, children){
        this.parentName = parentName;
        this.name = name;
        this.children = children;
    };

    for (var i1 = 0, l1 = pages.length; i1 < l1; i1++) {

      var page = pages[i1],
          path;

      if (page.status !== 200 || page.contentType === "text/css" || page.contentType === "text/javascript" || page.contentType === "text/plain" || page.contentType === "text/plain; charset=UTF-8") {
        continue;
      }
      
      path = urlObj.parse(page.url).path;
      var parts = path.split('/');
      parts.shift();

      for (var i2 = 0, l2 = parts.length; i2 < l2; i2++) {

        var part = new node(parts[i2 - 1], parts[i2], []);  
        baseArray.push(part);   
                        
      }

    }

    console.log(baseArray) 
    
    var findByName = function(array, name){
      var array = array,
          name = name;

      for (var num in array) {
        if (array[num].name === name) {
          return array[num];
        }
      }   

    }

    for (var i3 = 0, l3 = baseArray.length; i3 < l3; i3++) {
      var item = baseArray[i3];
      var parent = findByName(baseArray, item.parentName);

      if (parent) {
        parent.children.push(item);
      } else {
        resultArray.push(item);
      }

    }

    // console.log(resultArray);


    Sitemap.create({
      name: "New sitemap",
      base_url: base_url,
      pages: resultArray
    }, function(err, sitemap) {
      if(err) {  handleError(res, err); }
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