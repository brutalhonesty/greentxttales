/* global greenTextApp */
'use strict';

greenTextApp.service('API', ['$http', function ($http) {
	return {
		getData: function (page) {
			return $http.get('/api/getData?page=' + page);
		}
	};
}]);
greenTextApp.service('$store', function () {
	// Use localStorage to verify that the user is 18
	return {
		get: function (key) {
			var item = window.localStorage.getItem(key) || null;
			return item;
		},
		put: function (key, value) {
			window.localStorage.setItem(key, value);
		}
	};
});