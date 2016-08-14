var express = require('express');
var router = express.Router();
var sessionMiddleware = require("../service/sessionMiddleware");

/* GET home page. */
router.get('/', sessionMiddleware.sessionCheck, function(req, res, next) {
	res.render('index', {
		user: !!res.locals&&!!res.locals.user?res.locals.user:null
	});
});

module.exports = router;
