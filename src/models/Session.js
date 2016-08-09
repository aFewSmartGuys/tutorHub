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

	insert: function(arr, tutor) {
		return new Promise(function(resolve, reject) {
			if (!arr.length) resolve([]);
			var sessions = arr.filter(function(s) {
				delete s.select;
				s.tutor = tutor;
				return s;
			});
			Session.create(sessions,function(err, saved) {
				if (err) reject(err);
				if (saved) {
					resolve(saved);
				} else {
					reject("error saving sessions");
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
			if (tutor) {
				query.tutor = tutor;
			}
			// important that we keep the _id because it is used in other when updating sessions
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
	},

	/**
	 * @param arr array of mongo _id objects
	 */
	remove: function(arr) {
		return new Promise(function(resolve, reject) {
			Session.remove({"_id":{"$in":arr}}, function(err, removed) {
				if (err) {console.log(err);reject(err);}
				resolve(removed);
			});
		});
	},

	getBookedByUser: function(username) {
		return new Promise(function(resolve, reject) {
			Session.find({"student.username":username,booked:true}, function(err, sessions) {
				if (err) {
					console.log(err);
					reject(err);
				} else {
					resolve(sessions);
				}
			});
		});
	},

	/**
	 * Update/create a single session
	 *
	 */
	update: function(s) {
		return new Promise(function(resolve, reject) {
			if (!s._id) reject("Session _id missing");
			Session.findOneAndUpdate({_id:s._id},s,{upsert:true,returnNewDocument:true},function(err, ns) {
				if (err) {
					console.log(err);
					reject(err);
				} else {
					resolve(ns);
				}
			});
		});
	}

};
