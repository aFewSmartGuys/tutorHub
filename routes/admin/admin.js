var express = require('express');
var router = express.Router();
var User = require('../../models/User');
var Session = require('../../models/Session');
var sessionMiddleware = require('../../service/sessionMiddleware');

/* GET home page. */
router.get('/', sessionMiddleware.enforceSession, sessionMiddleware.enforceAdmin, function(req, res, next) {
	res.render('admin/dashboard');
});

router.get('/users', sessionMiddleware.enforceSessionRest, sessionMiddleware.enforceAdminRest, function(req, res, next) {
	User.getAll().then(function(users) {
		res.setHeader("Content-Type", "application/json");
		res.json(users);
	}, function(err) {
		res.json({error:err});
	});
});

router.get('/sessions', sessionMiddleware.enforceSessionRest, sessionMiddleware.enforceAdminRest, function(req, res, next) {
	Session.getAll().then(function(sessions) {
		res.setHeader("Content-Type", "application/json");
		res.json(sessions);
	}, function(err) {
		res.json({error: err});
	});
});

router.post('/sessions/create', sessionMiddleware.enforceSessionRest, sessionMiddleware.enforceAdminRest, function(req, res, next) {
	// add the tutor to the session
	var s = req.body;
	s.student = {};
	s.tutor = {};
	Session.new(s).then(function(data){
		res.setHeader("Content-Type", "application/json");
		res.json(data);
	}, function(err){
		console.log(err);
		res.json({error: err});
	});
});

module.exports = router;
