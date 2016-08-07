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
	$scope.sessions = [];
	$http({
		method: "GET",
		url: "/admin/sessions"
	}).then(function(response) {
		$scope.sessions = response.data.map(function(s){
			s.date = new Date(s.date);
			return s;
		});
		console.log("");
	});
}

function createSessionCtrl($scope, $http) {
	let conf = {
		weeks:1,
		tutor:"",
		start:8,
		end:20,
		length:30,
		exclude:[]
	};
	$scope.sessions = genSessionList(conf);

	$scope.create = function() {
		var session = {
			date: $scope.dateTime,
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

/**
 * Generate ann array of sessions with the given constraints
 * @param conf:
 *	- weeks: number the amount of weeks to be generated
 *	- tutor: id for the tutor to check for existing sessions
 *	- start: number the time to start sessions every day (whole nunmber)
 *	- end: number the time to end sessions every day (whole number)
 *	- length: number the session length in minutes
 *	- exclude: number an array of days to exclude
 */
function genSessionList(conf) {
	var week = [{mon:[]},{tue:[]},{wed:[]},{thu:[]},{fri:[]},{sat:[]},{sun:[]}],
		sessions = [];

	for (let i = 0; i < conf.weeks; ++i) {
		week.forEach(function(day, index) {
			let date = new Date();
			date.setMilliseconds(0);
			date.setSeconds(0);
			date.setDate(date.getDate()+index+(i*7));
			date.setMinutes(0);
			day.date = date.toDateString();
			sessions.push(day)
			for (let k = Math.trunc(conf.start); k < Math.trunc(conf.end); ++i) {
				
				day.booked = false;

			}
		});
	}
}

// organize the sessions into an array of days
function rearrange(arr) {
	var week = [];
	arr.sort(function(a,b) {
		let d1 = new Date(a.date), d2 = new Date(b.date);
		if (d1 < d2) return -1;
		if (d1 > d2) return 1;
		return 0;
	});
	arr.forEach(function(sesh) {
		let added = false;
		sesh.date = new Date(sesh.date);
		let dateString = sesh.date.toDateString();
		week.forEach(function(day) {
			if (day.name === dateString) {
				// means the current sesh"s day has already been created in the week array
				// so we simply add this session to the array of sessions in the day of the week
				day.sessions.push(sesh);
				added = true;
			}
		});
		if (!added) {
			// means the current session was not added to the week array because its day has
			// not yet been created.
			// so we create a day in the week array for the sesh with the sesh added to it
			var newDay = {};
			newDay.sessions = [sesh];
			newDay.name = dateString;
			week.push(newDay);
		}
	});
	console.log(week);
	return week;
}
