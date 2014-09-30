'use strict';

angular.module('simpApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/:map_id', {
        templateUrl: 'app/map/map.html',
        controller: 'MapCtrl'
      });
  });
