var app = angular.module('scheduleApp', []);

app.controller("mainCtrl", ["$scope", "$http", mainCtrl]);

function mainCtrl($scope, $http) {
	$scope.days = [];
	$http({
		method: "GET",
		url: "/user/sessions"
	}).then(function(response) {
		$scope.days = rearrange(response.data);
	});
	$scope.bookSession = function(sesh) {
		$http({
			method: "POST",
			url: "/user/sessions/book",
			headers: {
				"Content-Type":"application/json"
			},
			data: sesh
		}).then(function(response) {
			console.log(response.data);
		});
	};
}

// organize the sessions into an array of days
function rearrange(arr) {
	var week = [];
	arr = arr.sort(function(a,b) {
		var d1 = new Date(a.date), d2 = new Date(b.date);
		if (d1 < d2) return -1;
		if (d1 > d2) return 1;
		return 0;
	});
	arr.forEach(function(sesh) {
		var added = false;
		sesh.date = new Date(sesh.date);
		var dateString = sesh.date.toDateString();
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