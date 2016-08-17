var express = require('express');
var router = express.Router();
var User = require('../../models/User');
var MenuOptions = require('../MenuOptions');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('application/portal', {
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
		res.status(200).json({
			status:"success",
			message:"Congrats, you done logged in"
		});
	}, function(responseText) {
		req.session.reset();
		res.status(400).json({
			status:"error",
			message:responseText
		});
	});
});

/* POST register a user */
router.post('/register', function(req, res, next) {
	var body = req.body;
	if (body.password === body.password2 && verifyUserAttrs(body)) {
		User.register({
			username: body.username,
			password: body.password,
			email: body.email,
			phone: body.phone
		}).then(function(user) {
			req.session.reset();
			req.session.username = body.username;
			res.setHeader("Content-Type", "application/json");
			res.status(200).json({
				status:"success",
				message:"Congrats you done registered"
			});
		}, function(err) {
			res.status(500).json({error:err});
		});
	} else {
		res.status(400).send("Invalid or missing fields");
	}
});

function verifyUserAttrs(user) {
	if (user.hasOwnProperty('username') &&
		user.hasOwnProperty('password') &&
		user.hasOwnProperty('email') &&
		user.hasOwnProperty('phone')) {
		if (user.username.length >= 5 &&
			user.password.length >= 5 &&
			valEmail(user.email) &&
			valPhone(user.phone)) {
			return true;
		}
	}
	return false;
}

function valEmail(e) {
	return e.match(/(\.|[a-zA-Z0-9])+\@[a-zA-Z0-9]+\.[a-zA-Z]+/)[0].length === e.length;
}

function valPhone(p) {
	return p.match(/[0-9]+/)[0].length === p.length &&
			p.length === 10;
}

module.exports = router;
