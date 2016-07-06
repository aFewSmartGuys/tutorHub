var app = angular.module("dashApp", ["ngRoute"]);

app.controller("mainCtrl", ["$scope", mainCtrl]);
app.controller("userCtrl", ["$scope", "$http", userCtrl]);
app.controller("sessionCtrl", ["$scope", "$http", sessionCtrl]);
app.controller("createSessionCtrl", ["$scope", "$http", createSessionCtrl]);

app.config(function($routeProvider) {
	$routeProvider.when("/users", {
		templateUrl: "/templates/admin/users.html",
		controller: "userCtrl"
	}).when("/sessions", {
		templateUrl: "/templates/admin/sessions.html",
		controller: "sessionCtrl"
	}).when("/createSession", {
		templateUrl: "/templates/admin/createSession.html",
		controller: "createSessionCtrl"
	});
});

function mainCtrl($scope, $route, $routeParams, $location) {
	$scope.$route = $route;
	$scope.$location = $location;
	$scope.$routeParams = $routeParams;
}

function userCtrl($scope, $http) {
	$http({
		method: "GET",
		url: "/admin/users"
	}).then(function(response) {
		$scope.users = response.data;
	});
}

function sessionCtrl($scope, $http) {
	$scope.days = [];
	$http({
		method: "GET",
		url: "/admin/sessions"
	}).then(function(response) {
		$scope.days = rearrange(response.data);
	});
}

function createSessionCtrl($scope, $http) {
	$scope.dateTime = new Date();
	$scope.dateTime.setMinutes(0);
	$scope.dateTime.setSeconds(0);
	$scope.dateTime.setMilliseconds(0);

	$scope.create = function() {
		var session = {
			date: {
				day: $scope.dateTime.toString().split(" ")[0],
				date: $scope.dateTime
			},
			booked: false
		}
		$http({
			method: "POST",
			url: "/admin/sessions/create",
			headers: {
				"Content-Type": "application/json"
			},
			data: session
		}).then(function(response) {
			console.log(response);
		})
	};
}

// organize the sessions into an array of days
function rearrange(arr) {
	var week = [];
	arr.sort(function(a,b) {
		var d1 = new Date(a.date.date), d2 = new Date(b.date.date);
		if (d1 < d2) return -1;
		if (d1 > d2) return 1;
		return 0;
	});
	arr.forEach(function(sesh) {
		var added = false;
		var dateString = new Date(sesh.date.date).toDateString();
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
