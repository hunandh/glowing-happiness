'use strict';

angular.module('simpApp')
  .controller('MainCtrl', function ($scope, $http, $location) {
    $scope.awesomeThings = [];
    $scope.baseUrl = '';
    $scope.sitemaps  = [];

    $http.get('/api/sitemaps/').success(function(sitemaps){
      $scope.sitemaps = sitemaps; 
    }); 

    $scope.create_sitemap = function(){
      console.log($scope.baseUrl);
      $http.post('/api/sitemaps', {
        base_url: $scope.baseUrl
      }).success(function(sitemap){
        //$scope.sitemap = sitemap;
        console.log(sitemap._id)
        $location.path(sitemap._id)
      })
    }

    $scope.viewSitmap = function(id){
      $location.path(id);
    }

    $scope.deleteSitemap = function(item_id){
      $http.delete('/api/sitemaps/' + item_id
      ).success(function(sitemaps){
        $scope.sitemaps = sitemaps; 
        console.log("one sitmap removed");
      })
    }
  });
