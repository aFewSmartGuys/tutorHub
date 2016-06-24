var app = angular.module("dashApp", []);

app.controller("mainCtrl", ["$scope", "$http", mainCtrl]);

function mainCtrl($scope, $http) {

	$http({
		method: "GET",
		url: "/admin/users"
	}).then(function(response) {
		$scope.users = response.data;
	});
}