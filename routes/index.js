var express = require('express');
var router = express.Router();
var sessionMiddleware = require("../service/sessionMiddleware");

/* GET home page. */
router.get('/', sessionMiddleware.sessionCheck, function(req, res, next) {
	res.render('index', {
		authLvl: res.locals.authLvl || 0,
		username: req.session.username
	});
});

module.exports = router;
