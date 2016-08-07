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
		start:12,
		end:13,
		fractionOfHour:1,
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
	var daysOfWeek = {
		0: "sun",
		1: "mon",
		2: "tue",
		3: "wed",
		4: "thu",
		5: "fri",
		6: "sat"
	},
	days = [];

	for (let i = 0; i < conf.weeks; ++i) {
		for (let k = 0; k < 7; ++k) {
			let date = new Date();
			date.setMilliseconds(0);
			date.setSeconds(0);
			date.setMinutes(0);
			date.setHours(0);
			date.setDate(date.getDate()+k+(i*7));
			
			let day = {
				sessions: [],
				date:date.toDateString()
			};
			days.push(day)
			for (let k = Math.trunc(conf.start); k < Math.ceil(conf.end); ++k) {
				for (let j = 0; j < conf.fractionOfHour; ++j) {
					date.setHours(k);
					date.setMinutes(j*conf.fractionOfHour);
					let session = {
						date:date,
						booked: false,
						tutor: {}
					};
					day.sessions.push(session);
				}
			}
		}
	}
	console.log(days);
	return days;
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
