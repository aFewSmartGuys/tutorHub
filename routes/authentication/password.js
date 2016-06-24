var express = require('express');
var router = express.Router();
var User = require('../../models/User');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('application/index');
});

/* POST log a user in */
router.post('/login', function(req, res, next) {
	var body = req.body,
		username = body.username || '',
		password = body.password || '';
	User.login({username:username, password:password}).then(function(portfolio) {
		//set the session
		//req.session.name = name;
		res.render('index');
	}, function(responseText) {
		//req.session.reset();
		console.log(responseText);
		res.status(400).json({error: 'error logging in.'});
	});
});

/* POST register a user */
router.post('/register', function(req, res, next) {
	var body = req.body;
	if (body.password !== body.password2) {
		res.json({error: 'Passwords do not match.'});
	} else {
		User.register({
			username: body.username,
			password: body.password,
			email: body.email,
			phone: body.phone
		}).then(function(responseText) {
			//req.session.name = body.name;
			res.render('index', {success:responseText});
		}, function(responseText) {
			console.log(responseText);
			res.json({error:responseText});
		});
	}
});

module.exports = router;
