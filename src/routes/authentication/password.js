var express = require('express');
var router = express.Router();
var User = require('../../models/User');
var MenuOptions = require('../MenuOptions');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('application/index', {
		menuOpts: new MenuOptions({homepage:true})
	});
});

router.get('/logout', function(req, res, next) {
	req.session.reset();
	res.render('index', {
		user: null,
		menuOpts: new MenuOptions({homepage:true})
	});
});

/* POST log a user in */
router.post('/login', function(req, res, next) {
	var body = req.body,
		username = body.username || '',
		password = body.password || '';
	User.login({username:username, password:password}).then(function(user) {
		//set the session
		req.session.reset();
		req.session.username = username;
		// check the permission lvl
		res.render('index', {
			user: user,
			menuOpts: new MenuOptions({
				homepage: true,
				authLvl: user.authLvl
			})
		});
	}, function(responseText) {
		req.session.reset();
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
		}).then(function(user) {
			req.session.reset();
			req.session.username = body.username;
			res.render('index', {
				success:responseText,
				username: req.session.username,
				authLvl: user.authLvl
			});
		}, function(err) {
			console.log(err);
			res.json({error:err});
		});
	}
});

module.exports = router;
