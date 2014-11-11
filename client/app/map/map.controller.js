'use strict';

angular.module('simpApp')
  .controller('MapCtrl', function ($scope, $http, $routeParams) {
    $http.get('/api/sitemaps/' + $routeParams.map_id).success(function(sitemap){
    	$scope.sitemap = sitemap;

    	$scope.column = "col" + sitemap.root.children.length;

    	console.log($scope.sitemap.root);
    })
  });
