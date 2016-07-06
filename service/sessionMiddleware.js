var User = require("../models/User");

var insufficientPermissions = {error:"Access Denied."};
var notAuthenticated = {error:"You are not logged in."};
var incorrectCredentials = {error:"Fake username bruh."};

function sessionCheck(req, res, next) {
	if (req.session && req.session.username) {
		User.getAuthLvl(req.session.username).then(function(authLvl) {
			res.locals.authLvl = authLvl;
			next();
		}, function(msg) {
			req.session.reset();
			res.render("application/index", incorrectCredentials);
		});
	} else {
		req.session.reset();
		res.render("application/index", notAuthenticated);
	}
}

function sessionCheckRest(req, res, next) {
	if (req.session && req.session.username) {
		User.getAuthLvl(req.session.username).then(function(authLvl) {
			res.locals.authLvl = authLvl;
			next();
		}, function(msg) {
			req.session.reset();
			res.status(403).json(incorrectCredentials);
		});
	} else {
		req.session.reset();
		res.status(403).json(notAuthenticated);
	}
}

function enforceAdminRest(req, res, next) {
	if (res.locals.authLvl === User.authLevels.admin) {
		next();
	} else {
		res.setHeader("Content-Type", "application/json");
		res.json(insufficientPermissions);
	}
}

function enforceAdmin(req, res, next) {
	if (res.locals.authLvl === User.authLevels.admin) {
		next();
	} else {
		res.render("application/index", insufficientPermissions);
	}
}

exports.sessionCheck = sessionCheck;
exports.sessionCheckRest = sessionCheckRest;
exports.enforceAdmin = enforceAdmin;
exports.enforceAdminRest = enforceAdminRest;
