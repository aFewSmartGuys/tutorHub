var mongoose = require("mongoose"),
	uniqueValidator = require("mongoose-unique-validator"),
	promise = require('promise'),
	bcrypt = require("bcrypt"),
	SALT_WORK_FACTOR = 12;

var UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true, uniqueCaseInsensitive: true },
	password: { type: String, required: true },
	email: { type: String, required: true, unique: true, uniqueCaseInsensitive: true },
	phone: { type: String, required: true },
	authLvl: { type: Number, required: true },
	lastLogin: { type: String },
	pref: { type: String }
});

UserSchema.plugin(uniqueValidator);

var authLevels = {
	none: 0,
	student: 1,
	tutor: 2,
	admin: 3
};

// bcrypt Middleware!
UserSchema.pre("save", function(next) {
	var user = this;
	// only hash the password if it has been modified (or is new)
	if (!user.isModified("password")) return next();
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);
		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) return next(err);
			user.password = hash;
			next();
		});
	});
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

var User = mongoose.model("User", UserSchema);

module.exports = {

	authLevels: authLevels,

	/**
	 * @param args: username, password, email, phone
	 */
	register: function(args) {
		return new promise(function(resolve, reject) {
			var date = new Date();
			var lastLogin = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();
			var user = new User({
				username: args.username,
				password: args.password,
				email: args.email,
				phone: args.phone,
				authLvl: 0,
				lastLogin: lastLogin
			});
			user.save(function(err, registeredUser) {
				if (err) reject(err);
				if (registeredUser) {
					resolve(registeredUser);
				} else {
					reject("Error creating user.");
				}
			});
		});
	},

	/* args: username password */
	login: function(args) {
		return new promise(function(resolve, reject) {
			User.findOne({username:args.username}, function(err, user) {
				if (err) reject(err);
				if (user) {
					user.comparePassword(args.password, function(err, success) {
						if (success) {
							// update last login
							var date = new Date();
							var lastLogin = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();
							user.lastLogin = lastLogin;
							user.save(function(err, updatedUser) {
								if (err) {
									reject(err);
								} else {
									resolve(updatedUser);
								}
							});
						} else {
							reject("incorrect Password");
						}
					});
				} else {
					reject("Fake username, bro.");
				}
			});
		});
	},

	changePassword: function(uname, oldp, newp) {
		return new promise(function(resolve, reject) {
			User.findOne({username: uname}, function(err, user) {
				if (err) reject(err);
				if (user) {
					user.comparePassword(oldp, function(err, match) {
						if (err) reject(err);
						if (match) {
							user.password = newp;
							user.save(function(err, doc) {
								if (err) reject(err);
								if (doc) {
									resolve("Password Updated");
								} else reject("Error updating Password");
							});
						} else reject("invalid password");
					});
				} else {
					reject("User not found.");
				}
			});
		});
	},

	getAll: function() {
		return new promise(function(resolve, reject) {
			User.find({}, { password: false, _id: false, __v: false }, function(err, content) {
				if (err) {
					console.log(err);
					reject(err);
				}
				resolve(content);
			});
		});
	},

	getAuthLvl: function(username) {
		return new promise(function(resolve, reject) {
			User.findOne({username: username}, {authLvl:true}, function(err, usr) {
				if (err) {
					console.log(err);
					reject(err);
				}
				resolve(usr.authLvl);
			});
		});
	},

	findByUsername: function(username) {
		return new promise(function(resolve, reject) {
			User.findOne({username:username}, {_id:false,username:true,email:true,phone:true,authLvl:true}, function(err, usr) {
				if (err) {
					console.log(err);
					reject(err);
				}
				resolve(usr);
			});
		});
	}
};
