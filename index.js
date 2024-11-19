//import and setting up middleware
var express = require('express'); //call express
var app = express(); //define our app using express

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://mizannoor:1q2w3e4r@cluster0.jhf6z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

//? models
const User = require('./user');
const Restaurant = require('./restaurant');
//? models

//? add the modules for using JSON Web Tokens
const auth = require('./auth')();
const jwt = require('jsonwebtoken');
const config = require('./config');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var port = process.env.PORT || 8080; //set our port

//Setting route and path
var router = express.Router();
router.get('/', (req, res) => {
	res.json({ message: 'Hula! my API works!!!' });
});

//register
router.post('/register', (req, res) => {
	const newUser = new User();
	newUser.email = req.body.email;
	newUser.password = req.body.password;

	newUser
		.save()
		.then(() => {
			res.json({ message: 'User successfully registered.' });
		})
		.catch((err) => {
			res.json({ error: 'message' + err });
		});
});

router.post('/login', async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });

		if (!user) {
			return res.status(404).json({ message: 'User not found!' });
		} else {
			/* if (user.password === req.body.password) {
        res.json({ message: 'OK. Authenticated' });
      } else {
        res.json({ message: 'Wrong password' });
      } */

			user.verifyPassword(req.body.password, (err, isMatch) => {
				if (err) {
					return res.status(500).json({ message: 'Something is wrong' });
				}

				if (!isMatch) {
					return res.status(401).json({ message: 'Wrong password' });
				} else {
					const token = jwt.sign(user.toJSON(), config.secret, { expiresIn: 10080 });

					// Send the token in response
					return res.status(200).json({ message: 'Success', token: 'JWT: ' + token });
				}
			});
		}
	} catch (err) {
		// Catch any other errors and send appropriate response
		return res.status(500).json({ message: 'An error occurred: ' + err.message });
	}
});

router.post('/restaurants', auth.authenticate(), (req, res) => {
	let newRestaurant = new Restaurant({
		name: req.body.name,
		address: req.body.address,
		email: req.body.email,
		phone: req.body.phone,
		description: req.body.description,
		opening_time: req.body.opening_time,
		latitude: req.body.latitude,
		longitude: req.body.longitude,
		types: req.body.types,
	});

	newRestaurant
		.save()
		.then(() => {
			res.status(201).json({ message: 'Restaurant successfully created!' });
		})
		.catch((err) => {
			console.error(err); // Log the error for debugging purposes
			if (!res.headersSent) {
				res.status(500).json({ error: 'Error occurred: ' + err.message });
			}
		});
});

app.use('/api', router);

app.listen(port); // create a server that browsers can connect to

console.log('Magic happened at port ' + port);
