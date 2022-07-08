var express = require('express');
var router = express.Router();
const Users = require('../models/Users');
// const Blogs = require('../models/Blogs');



// router.get('/:slug', (req, res) => (
// 	req.params.slug
// ))


// register
router.post('/register', (req, res) => {
	var myUser = {
		username: req.body.username,
		email: req.body.email,
		age: req.body.age,
		password: req.body.password
	}

	Users.findOne({email: req.body.email}, (err,user) => {
		if(err) {
			return res.render('register', {msg: err})
		}

		if(user) {
			return res.render('register', {msg: 'Tài khoản đã tồn tại'});
		}

		new Users(myUser).save().then(res.redirect('/login'));
	})

})

router.get('/register', (req, res) => {
	res.render('register');
})

// login
router.get('/login', (req, res) => {
	res.render('login');
})

router.post('/login', (req, res) => {
	Users.findOne({username: req.body.username}, (err, user) => {
		if(user) {
			console.log('Thành công');
			res.redirect('/');
		}
	})
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
