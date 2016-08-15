var express = require('express');
var router = express.Router();
var User = require('../../models/User');
var Session = require('../../models/Session');
var sessionMiddleware = require('../../service/sessionMiddleware');
var MenuOptions = require('../MenuOptions');

/* GET home page. */
router.get('/', sessionMiddleware.enforceSession, sessionMiddleware.enforceAdmin, function(req, res, next) {
	res.render('admin/dashboard', {
		user: res.locals.user,
		menuOpts: new MenuOptions({
			custom: [
				{value:'Users',href:'#users'},
				{value:'Sessions',href:'#sessions'},
				{value:'Create Sessions',href:'#sessions/create'},
			]
		})
	});
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
		Session.getUpcoming(tutor.username).then(function(sessions) {
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

router.post('/sessions/update', sessionMiddleware.enforceSessionRest, sessionMiddleware.enforceAdminRest, function(req, res, next) {
	// add the tutor to the session
	if (!(req.body instanceof Array)) {
		res.status(400).json({error:"Body is not array of sessions."});
	}

	var add = [], remove = [];
	req.body.forEach(function(s) {
		if (s.select) {
			add.push(s);
		} else {
			// docs to remove will already exist which means they will have an _id field
			remove.push(s._id);
		}
	});

	User.findByUsername(req.session.username).then(function(tutor){
		Session.insert(add, tutor).then(function(inserted){
			// then remove the data
			Session.remove(remove).then(function(removed){
				res.setHeader("Content-Type", "application/json");
				res.json({in:inserted,re:remove});
			}, function(err) {
				console.log(err);
				res.status(500).json({error: err});
			});
		}, function(err){
			console.log(err);
			res.status(500).json({error: err});
		});
	});
});

module.exports = router;
