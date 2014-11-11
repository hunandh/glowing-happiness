'use strict';

angular.module('simpApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.menu = [
    {
      'title': 'Create new',
      'link': '/'
    },
    {
      'title': 'login',
      'link': '/'
    }
    ];

    $scope.isCollapsed = true;

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });