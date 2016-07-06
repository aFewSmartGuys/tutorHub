var express = require('express');
var router = express.Router();
var User = require('../../models/User');
var Session = require('../../models/Session');
var sessionMiddleware = require("../../service/sessionMiddleware");

router.get('/', sessionMiddleware.sessionCheck, function(req, res, next) {
  res.render('application/booking');
});

router.get('/sessions', sessionMiddleware.sessionCheckRest, function(req, res, next) {
	var end = new Date();
	var beginning = new Date();
	end.setDate(getDate() + 7);
	Session.getTimeRange(beginning, end).then(function(sessions) {
		res.setHeader("Content-Type", "application/json");
		res.json(sessions);
	}, function(err) {
		res.json({error: err});
	});
});

module.exports = router;
