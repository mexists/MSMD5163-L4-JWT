const mongoose = require('mongoose');
const bcrypt = require('bcrypt-node'); /*provides functions for hashing and comparing passwords*/

const UserModel = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, minLength: 6 },
});


UserModel.pre('save', function (callback) {
	/*executes a function before a user document is saved to the database*/ var user = this;
	if (!user.isModified('password')) {
		/*no password hashing is needed if password not modified*/
		return callback();
	}

	/*generate a random salt to add to the original password for protection then only encrypt*/

	bcrypt.genSalt(5, function (err, salt) {
		if (err) return callback(err);

		/*Hashes the user's password*/
		bcrypt.hash(user.password, salt, null, function (err, hash) {
			if (err) return callback(err);
			user.password = hash; /*Updates the password with the generated hash*/
			callback(); /*user document is ready to be saved*/
		});
	});
});

UserModel.methods.verifyPassword = function (password, callback) {
	/*it will check if the hash of "password" is the same with the one in db by comparing the password pass in parameter with the stored password (hash+salt) in db*/
	bcrypt.compare(password, this.password, (err, isMatch) => {
		if (err) throw callback(err);

		callback(null, isMatch);
	});
};

module.exports = mongoose.model('User', UserModel);
