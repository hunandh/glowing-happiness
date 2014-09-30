'use strict';

angular.module('simpApp')
  .controller('MapCtrl', function ($scope, $http, $routeParams) {
    $http.get('/api/sitemaps/' + $routeParams.map_id).success(function(sitemap){
    	$scope.sitemap = sitemap;

    	console.log($scope.sitemap);
    })
  });
