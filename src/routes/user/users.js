'user strict';

var express = require('express');
var router = express.Router();
var User = require('../../models/User');
var Session = require('../../models/Session');
var sessionMiddleware = require("../../service/sessionMiddleware");

router.get('/', sessionMiddleware.enforceSession, function(req, res, next) {
  res.render('application/booking');
});

router.get('/sessions', sessionMiddleware.enforceSessionRest, function(req, res, next) {
	var end = new Date();
	var beginning = new Date();
	end.setDate(beginning.getDate() + 7);
	Session.getTimeRange(beginning, end).then(function(sessions) {
		res.setHeader("Content-Type", "application/json");
		res.json(sessions);
	}, function(err) {
		res.json({error: err});
	});
});

router.post('/sessions/book', sessionMiddleware.enforceSessionRest, function(req, res, next) {
	res.setHeader("Content-Type", "application/json");
	var session = cleanSession(req.body);

	enforceBookingRestrictions(res.locals.user.authLvl, maxSessions(res.locals.user.authLvl), res).then(function(data) {
		session.student = res.locals.user;
		session.booked = true;
		Session.update(session).then(function(s){
			console.log(s);
			res.json({success:{
				message: "Successfully booked the session",
				data: s
			}})
		}, function(err) {
			console.log("failure");
			console.log(err);
			res.status(500).json({error:{
				message:"Error booking session"
			}})
		});
	}, function(errData) {
		console.log("ummm how did we get here");
	});
});

function enforceBookingRestrictions(username,max,res) {
	return new Promise(function(resolve, reject) {
		Session.getBookedByUser(username).then(function(sessions) {
			if (sessions.length >= max) {
				res.json({error:{
					message:"You have already booked your allowed number of sessions"
				}});
			}
			resolve({});
		}, function(err) {
			console.log(err);
			var message = "Error looking up user "+username+"'s sessions";
			res.status(500).json({error:{
				message:message
			}});
		});
	});
}

function cleanSession(s,keys) {
	keys = keys || [];
	var attrs = ["_id","__v","date","tutor","booked"].concat(keys);
	for (a in Object.keys(s)) {
		if (!~attrs.indexOf(a)) {
			delete s[a];
		}
	}
	return s;
}

function maxSessions(authlvl) {
	return authlvl+1
}

module.exports = router;
