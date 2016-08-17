var User = require("../models/User");

var insufficientPermissions = {error:"Access Denied."};
var notAuthenticated = {error:"You are not logged in."};
var incorrectCredentials = {error:"Fake username bruh."};

function enforceSession(req, res, next) {
	if (req.session && req.session.username) {
		if (res.locals && res.locals.user) {
			next();
		} else {
			User.findByUsername(req.session.username).then(function(user) {
				res.locals.user = user;
				next();
			}, function(msg) {
				req.session.reset();
				res.render("application/portal", incorrectCredentials);
			});
		}
	} else {
		req.session.reset();
		res.render("application/portal", notAuthenticated);
	}
}

function enforceSessionRest(req, res, next) {
	if (req.session && req.session.username) {
		if (res.locals && res.locals.user) {
			next();
		} else {
			User.findByUsername(req.session.username).then(function(user) {
				res.locals.user = user;
				next();
			}, function(msg) {
				req.session.reset();
				res.status(403).json(incorrectCredentials);
			});
		}
	} else {
		req.session.reset();
		res.status(403).json(notAuthenticated);
	}
}

function enforceAdminRest(req, res, next) {
	if (res.locals.user.authLvl === User.authLevels.admin) {
		next();
	} else {
		res.setHeader("Content-Type", "application/json");
		res.json(insufficientPermissions);
	}
}

function enforceAdmin(req, res, next) {
	if (res.locals.user.authLvl === User.authLevels.admin) {
		next();
	} else {
		res.render("application/portal", insufficientPermissions);
	}
}

function sessionCheck(req, res, next) {
	if (req.session && req.session.username) {
		if (res.locals && res.locals.user) {
			next();
		} else {
			User.findByUsername(req.session.username).then(function(user) {
				res.locals.user = user;
				next();
			}, function(msg) {
				req.session.reset();
				res.render("application/portal", incorrectCredentials);
			});
		}
	} else {
		next();
	}
}

exports.enforceSession = enforceSession;
exports.enforceSessionRest = enforceSessionRest;
exports.enforceAdmin = enforceAdmin;
exports.enforceAdminRest = enforceAdminRest;
exports.sessionCheck = sessionCheck;
