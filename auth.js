const JwtStrategy = require('passport-jwt').Strategy;
const extractJwt = require('passport-jwt').ExtractJwt;

const User = require('./user');
const config = require('./config');
const passport = require('passport');

const params = {
	//Sets the secret key used for signing and verifying JWT tokens
	secretOrKey: config.secret,

	/*Specifies that the JWT token should be extracted from the Authorization header of the request*/
	jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
};

module.exports = function () {
	/*payload:  contains the decoded data from the JWT token after verification*/
	const strategy = new JwtStrategy(params, function (payload, done) {
		User.findOne({ id: payload.id })
			.then((user) => {
				if (user) {
					//user is exist
					/*contains the decoded data from the JWT token after verification*/
					return done(null, user);
				} else {
					/*failed authentication*/
					return done(null, false);
				}
			})
			.catch((err) => {
				return done(err, false);
			});
	});

	passport.use(strategy); //Registers the created JWT strategy
	return {
		initialize: function () {
			return passport.initialize(); //initialize Passport.js
		},
		authenticate: function () {
			/*performs JWT authentication and ensures sessions are not used*/
			return passport.authenticate('jwt', { session: false });
		},
	};
};
