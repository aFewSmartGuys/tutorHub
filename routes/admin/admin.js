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
	Session.getUpcoming().then(function(sessions) {
		res.setHeader("Content-Type", "application/json");
		res.json(sessions);
	}, function(err) {
		res.status(500).json({error: err});
	});
});

router.get('/sessions/list/:tutor', sessionMiddleware.enforceSessionRest, sessionMiddleware.enforceAdminRest, function(req, res, next) {
	User.findByUsername(req.params.tutor).then(function(tutor) {
		Session.getUpcoming(tutor).then(function(sessions) {
			res.setHeader("Content-Type", "application/json");
			res.json(sessions);
		}, function(err) {
			res.status(500).json({error:err});
		});
	}, function(err){
		console.log(err);
		res.status(500).json({error:err});
	});
});

router.post('/sessions/create', sessionMiddleware.enforceSessionRest, sessionMiddleware.enforceAdminRest, function(req, res, next) {
	// add the tutor to the session
	if (!(req.body instanceof Array)) {
		res.status(400).json({error:"Body is not array of sessions."});
	}

	User.findByUsername(req.session.username).then(function(tutor){
		Session.upsert(req.body, tutor).then(function(data){
			res.setHeader("Content-Type", "application/json");
			res.json(data);
		}, function(err){
			console.log(err);
			res.status(500).json({error: err});
		});
	});
});

module.exports = router;
