var express = require('express');
var router = express.Router();
var User = require('../../models/User');
var Session = require('../../models/Session');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin/dashboard');
});

router.get('/users', function(req, res, next) {
	User.getAll().then(function(users) {
		res.setHeader("Content-Type", "application/json");
		res.json(users);
	}, function(err) {
		res.json({error:err});
	});
});

router.get('/sessions', function(req, res, next) {
	Session.getAll().then(function(sessions) {
		res.setHeader("Content-Type", "application/json");
		res.json(sessions);
	}, function(err) {
		res.json({error: err});
	});
});

module.exports = router;
