var express = require('express');
var router = express.Router();
var sessionMiddleware = require("../service/sessionMiddleware");
var MenuOptions = require('./MenuOptions');

/* GET home page. */
router.get('/', sessionMiddleware.sessionCheck, function(req, res, next) {
	var user = !!res.locals&&!!res.locals.user?res.locals.user:null;
	res.render('index', {
		user: user,
		menuOpts: new MenuOptions({
			homepage:true,
			authLvl: user ? user.authLvl : 0
		})
	});
});

module.exports = router;
