/* global greenTextApp */
'use strict';

greenTextApp.directive('error', function () {
	return {
		restrict: 'A',
		link: function ($scope, element) {
			$scope.$watch('error', function () {
				element.html('<p>>Be site. </p><p>>No Stories :(</p>');
			});
		}
	};
});
greenTextApp.directive('greens', function () {
	return {
		restrict: 'A',
		link: function ($scope, element) {
			$scope.$watch('line', function () {
				var text = element.html();
				if(text.indexOf('&gt;') === 0) {
					element.attr('id', 'greenText');
				} else {
					element.attr('id', 'normalText');
				}
			});
		}
	};
});