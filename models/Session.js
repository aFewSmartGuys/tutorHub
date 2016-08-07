var mongoose = require("mongoose"),
	uniqueValidator = require("mongoose-unique-validator");

var SessionSchema = new mongoose.Schema({
	date: { type: Date, required: true },
	booked: { type: Boolean, default: false },
	tutor: {
		username: String,
		email: String,
		phone: String,
		authLvl: String
	},
	student: {
		username: String,
		email: String,
		phone: String,
		authLvl: String
	}
});

var days = [];

SessionSchema.plugin(uniqueValidator);

var Session = mongoose.model("Session", SessionSchema);

module.exports = {

	new: function(args) {
		return new Promise(function(resolve, reject) {
			var date = new Date();
			var session = new Session({
				date: args.date,
				booked: args.booked,
				tutor: args.tutor,
				student: args.student
			});
			session.save(function(err, savedSession) {
				if (err) reject(err);
				if (savedSession) {
					console.log(savedSession);
					resolve("User created successfully.");
				} else {
					reject("error saving session");
				}
			});
		});
	},

	getAll: function() {
		return new Promise(function(resolve, reject) {
			Session.find({}, function(err, sessions) {
				if (err) {
					console.log(err);
					reject(err);
				}
				resolve(sessions);
			});
		});
	},

	getUpcoming: function(tutor) {
		return new Promise(function(resolve, reject) {
			var today = new Date();
			var query = { 
				"date": {
					"$gte": today
				}
			};
			if (!!tutor) {
				query.tutor = tutor;
			}
			Session.find(query, function(err, sessions) {
				if (err) {console.log(err);reject(err);}
				resolve(sessions);
			});
		});
	},

	/**
	 * Get all sessions in between b and e
	 * @param b Date the beginning date
	 * @param e Date the end date
	 */
	getTimeRange: function(b,e) {
		return new Promise(function(resolve, reject) {
			Session.find({ "date": { "$gte": b, "$lt": e } }, function(err, sessions) {
				if (err) { console.log(err);reject(err); }
				resolve(sessions);
			});
		});
	}

};
