var mongoose = require("mongoose"),
	bcrypt = require("bcrypt"),
	SALT_WORK_FACTOR = 12;

var UserSchema = new mongoose.Schema({
	username: { type: String, required: true, index: { unique: true } },
	password: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	phone: { type: String, required: true },
	authLvl: { type: String, required: true },
	lastLogin: { type: String },
	pref: { type: String }
});

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
		return new Promise(function(resolve, reject) {
			var date = new Date();
			var lastLogin = date.getMonth() +" /" + date.getDate() + "/" + date.getFullYear();
			var user = new User({
				username: args.username,
				password: args.password,
				email: args.email,
				phone: args.phone,
				authLvl: authLevels.none,
				lastLogin: lastLogin
			});

			User.save(function(err, registeredUser) {
				if (err) {
					reject(err);
					return;
				}
				if (registeredUser) {
					console.log(registeredUser);
					resolve("User created successfully.");
				} else {
					reject("A user has already been created.");
				}
			});
		});
	},

	login: function(args) {
		return new Promise(function(resolve, reject) {
			User.findOne({username:args.username}, function(err, user) {
				if (err) {
					reject("User not found");
					return;
				}
				if (user) {
					user.comparePassword(args.password, function(err, success) {
						if (success) {
							// update last login
							var date = new Date();
							var lastLogin = date.getMonth() +" /" + date.getDate() + "/" + date.getFullYear();
							user.lastLogin = lastLogin;
							user.save(function(err, updatedUser) {
								if (err) {
									reject(err);
								} else {
									console.log(updatedUser);
									resolve("login success");
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
	}
};
