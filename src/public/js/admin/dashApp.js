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
	}).when("/sessions/create", {
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
	});
}

function createSessionCtrl($scope, $http) {
	let conf = {
		weeks:1,
		tutor:"santi",
		start:12,
		end:14,
		fractionOfHour:2,
		exclude:[]
	};

	$scope.sessionClick = function(session) {
		if (session.booked) {
			//make toastr
			toastr.error("You can't delete a booked session, bro.", "Erroneous Click");
			return;
		}
		session.select = session.select?false:true;
	};

	$scope.save = function() {
		var toSave = $scope.days.map(function(s){return s.sessions;});
		toSave = [].concat.apply([], toSave);
		// keep new selections and old sessions to be removed
		toSave = toSave.filter(function(s){return ((s.select&&!s._id)||(!s.select&&s._id))&&!s.booked;});
		if (!toSave.length) {
			toastr.warning("Do something before you try to save, dude.", "No Data");
			return;
		}
		$http({
			method: "POST",
			url: "/admin/sessions/update",
			headers: {
				"Content-Type": "application/json"
			},
			data: toSave
		}).then(function(response) {
			// update the sessions
			// add the mongo _id to Newly created sessions
			// Remove the mongo _id from deleted sessions
			var n = response.data.in,//sert
				r = response.data.re;//move

			var sessions = $scope.days.map(function(s){return s.sessions;});
			var flattened = [];
			for (var i=0; i<sessions.length; ++i) {
				var current = sessions[i];
				for (var j=0; j<current.length; ++j)
					flattened.push(current[j]);
			}
			n.forEach(function(ns) {
				flattened.some(function(s) {
					if (new Date(s.date).getTime() === new Date(ns.date).getTime()) {
						s._id = ns._id;
						return true;
					}
					return false;
				});
			});
			r.forEach(function(rs) {
				flattened.some(function(s) {
					if (s._id === rs) {
						delete s._id;
						return true;
					}
					return false;
				});
			});
			toastr.success("Sessions Updated");
		});
	};

	$scope.setupSessions = function(tutor) {
		$http({
			method:"GET",
			url:"/admin/sessions/list/"+tutor,
		}).then(function(response) {
			$scope.days = genSessionList(conf, response.data);
		})
	};

	$scope.setupSessions(conf.tutor);
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
function genSessionList(conf, savedSessions) {
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
	savedSessions = savedSessions || [];

	for (let week = 0; week < conf.weeks; ++week) {
		for (let dayOfWeek = 0; dayOfWeek < 7; ++dayOfWeek) {
			let date = new Date();
			date.setMilliseconds(0);
			date.setSeconds(0);
			date.setMinutes(0);
			date.setHours(0);
			date.setDate(date.getDate()+dayOfWeek+(week*7));
			
			let day = {
				sessions: [],
				date:date
			};
			days.push(day)
			if (conf.start<0)conf.start = 0;
			// create sessions and add them to the current day
			for (let hour = Math.trunc(conf.start); hour < Math.ceil(conf.end); ++hour) {
				if (hour>23) break;
				const sessionLength = 60/conf.fractionOfHour;
				for (let minute = 0; minute < conf.fractionOfHour; ++minute) {
					let seshDate = new Date(date);
					seshDate.setHours(hour);
					seshDate.setMinutes(minute*sessionLength);
					let session = {
						date:seshDate,
						booked: false,
						tutor: {},
						select: false
					};

					var sesh = savedSessions.find(function(el){
						return new Date(el.date).getTime() === seshDate.getTime();
					});
					if (sesh) {
						session = sesh;
						session.select = true;
					}

					day.sessions.push(session);
				}
			}
		}
	}
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
	return week;
}
