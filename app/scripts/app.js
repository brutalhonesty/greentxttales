'use strict';
var greenTextApp = angular.module('greenTextApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute']);
greenTextApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'partials/main',
      controller: 'MainCtrl'
    })
    .when('/sfw', {
      templateUrl: 'partials/main',
      controller: 'MainCtrl'
    })
    .when('/:page', {
      templateUrl: 'partials/main',
      controller: 'MainCtrl'
    })
    .when('/sfw/:page', {
      templateUrl: 'partials/main',
      controller: 'MainCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
  $locationProvider.html5Mode(true);
}]);