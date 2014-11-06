'use strict';

angular.module('simpApp')
  .controller('MainCtrl', function ($scope, $http, $location) {
    $scope.awesomeThings = [];
    $scope.baseUrl = '';

/*
    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };
*/

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
  });
