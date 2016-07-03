var express = require('express');
var router = express.Router();
var User = require('../../models/User');

router.get('/', function(req, res, next) {
  res.render('application/booking');
});

module.exports = router;
