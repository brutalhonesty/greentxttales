/* global greenTextApp */
'use strict';
// TODO Client-side breaks in production. $digest is called too many times.
greenTextApp.controller('MainCtrl', ['$scope', 'API', '$store', '$sce', '$location', function ($scope, api, $store, $sce, $location) {
  var over18 = JSON.parse($store.get('OVER18'));
  if(over18 !== null) {
    $scope.overEighteen = over18;
  }
  var sfw = JSON.parse($store.get('SFW'));
  if(sfw !== null) {
    $scope.sfw = sfw;
  } else {
    $scope.sfw = false;
  }
  $scope.page = 1;
  $scope.noMoreStories = false;
  if($scope.overEighteen) {
    $scope.verified = true;
  }
  if($location.path() === '/sfw') {
    $scope.sfw = true;
  }
  api.getData($scope.page).success(function (data) {
    if(data.length === 0) {
      $scope.error = true;
    }
    $scope.greenTales = data;
  }).error(function (error) {
    $scope.error = error;
  });
  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  };
  $scope.submitVerification = function() {
    $store.put('OVER18', $scope.overEighteen);
    $store.put('SFW', $scope.sfw);
    if(!$scope.overEighteen) {
      $scope.showVerifyError = true;
      $scope.verified = false;
    } else {
      $scope.verified = true;
    }
  };
  $scope.$watch('sfw', function () {
    $store.put('SFW', $scope.sfw);
    if(!$scope.sfw) {
      $location.path('/');
      $scope.storyTemplate = 'views/partials/nsfw.html';
    } else {
      $location.path('/sfw');
      $scope.storyTemplate = 'views/partials/sfw.html';
    }
  });
  $scope.moreStories = function() {
    $scope.page += 1;
    api.getData($scope.page).success(function (data) {
      if (data.length !== 0) {
        $scope.greenTales = $scope.greenTales.concat(data);
        $scope.noMoreStories = false;
      }
      else {
        $scope.noMoreStories = true;
      }
    }).error(function (error) {
      $scope.error = error;
    });
  };
}]);