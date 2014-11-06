'use strict';

var _ = require('lodash');
var Sitemap = require('./sitemap.model');
var crawl = require('crawl');
var urlObj = require('url');
var inspect = require('util').inspect;

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
  // TODO: validate base url on the client
  var base_url = "http://" + req.body.base_url,
      // array representation of the sitemap, for faster searching
      sitemap = [],
      // root node of the graph represenation of the sitemap
      root;
  
  function Node(name) {
    this.name = name;
    this.children = [];
  }
  
  function find(level, node) {
    var n;
    for (var i = 0, l = sitemap[level].length; i < l; i++) {
      n = sitemap[level][i];
      if (n.name === node.name) {
        return n;
      }
    }
    return false;
  }
  
  console.log('crawling', base_url);

  crawl.crawl(base_url, function(err, pages) {
//  var pages = [
//    base_url + '/',
//    base_url + '/about',
//    base_url + '/sign-up',
//    base_url + '/sign-in',
//    base_url + '/sign-in/',
//    base_url + '/blog/',
//    base_url + '/blog/post-1/',
//    base_url + '/blog/post-2/',
//    base_url + '/blog/post-3/',
//    base_url + '/blog/post-3#should-be-ignored',
//    base_url + '/blog/post-1/comment-1',
//    base_url + '/blog/post-1/comment-2',
//    base_url + '/blog/post-1/comment-3',
//    base_url + '/blog/post-1/comment-3/',
//  ];
    
    var page,
        path,
        parts,
        part,
        level,
        node,
        parent,
        nodeInArray;

    if (err) {
      console.error("An error occured", err);
      return;
    }
    
    // create root node from the base url
    root = new Node(base_url);
    // store root node at level 0 of the sitemap
    sitemap[0] = [root];

    for (var i = 0, l = pages.length; i < l; i++) {

      page = pages[i];

      if (page.status !== 200 || page.contentType === "text/css" || page.contentType === "text/javascript" || page.contentType === "text/plain" || page.contentType === "text/plain; charset=UTF-8") {
        continue;
      }
      
      path = urlObj.parse(page.url).path;
      // path = urlObj.parse(page).path;
      parts = path.split('/');
      // loop from level 1 to parts.length (level 0 is the root node)
      level = 1;
      // initialise the root note as the first parent
      parent = root;
      
      while (parts.length) {
        part = parts.shift();
        
        if (part && part.length) {
          node = new Node(part);
          
          if (!sitemap[level]) {
            sitemap[level] = [];
          }
          
          // find the node in array
          nodeInArray = find(level, node);
          
          if (!nodeInArray) {
            sitemap[level].push(node);
            // if it doesn't exist yet, this means that it also hasn't been added as a child of the current root node, so add it too
            parent.children.push(node);
            nodeInArray = node;
          }
          
          // setup parent for the next iteration
          parent = nodeInArray;
        }
        
        level++;
      }
    }

//    console.log('array sitemap');
//    console.log(sitemap);
    console.log('graph sitemap');
//     console.log(root); - need to use util.inspect to log all nested levels of the graph
    console.log(inspect(root, false, null));
    
    Sitemap.create({
      name: "New sitemap",
      base_url: base_url,
      root: root
    }, function(err, root) {
      if(err) {  handleError(res, err); }
      res.json(root);
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