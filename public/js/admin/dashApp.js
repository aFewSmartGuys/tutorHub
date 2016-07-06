var app = angular.module("dashApp", ["ngRoute"]);

app.controller("mainCtrl", ["$scope", mainCtrl]);
app.controller("userCtrl", ["$scope", "$http", userCtrl]);
app.controller("sessionCtrl", ["$scope", "$http", sessionCtrl]);

app.config(function($routeProvider) {
	$routeProvider.when("/users", {
		templateUrl: "/templates/admin/users.html",
		controller: "userCtrl"
	}).when("/sessions", {
		templateUrl: "/templates/admin/sessions.html",
		controller: "sessionCtrl"
	});
});

function mainCtrl($scope, $route, $routeParams, $location) {
	$scope.$route = $route;
	$scope.$location = $location;
	$scope.$routeParams = $routeParams;
}

function userCtrl($scope, $http, $routeParams) {
	$http({
		method: "GET",
		url: "/admin/users"
	}).then(function(response) {
		$scope.users = response.data;
	});
}

function sessionCtrl($scope, $http, $routeParams) {
	$scope.days = [];
	$http({
		method: "GET",
		url: "/admin/sessions"
	}).then(function(response) {
		$scope.days = rearrange(response.data);
	});
}

// organize the sessions into an array of days
function rearrange(arr) {
	var week = [];
	arr.sort(function(a,b) {
		if (a.date.date < b.date.date) return -1;
		if (a.date.date > b.date.date) return 1;
		return 0;
	});
	arr.forEach(function(sesh) {
		var added = false;
		var dateString = sesh.toDateString();
		week.forEach(function(day) {
			if (Object.keys(day).indexOf(dateString) !== -1) {
				// means the current sesh"s day has already been created in the week array
				// so we simply add this session to the array of sessions in the day of the week
				day.dateString.push(sesh);
				added = true;
			}
		});
		if (!added) {
			// means the current session was not added to the week array because its day has
			// not yet been created.
			// so we create a day in the week array for the sesh with the sesh added to it
			var newDay = {};
			newDay[dateString] = [sesh];
			week.push(newDay);
		}
	});
	return week;
}
