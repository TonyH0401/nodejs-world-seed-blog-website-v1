var express = require('express');
const Users = require('../models/Users');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/:slug', (req, res, next) => {
  //slug database
  Users.findOne({ slug: req.params.slug })
    .then(user => {
      if (!user) {
        return res.send('404 Not found');
      }

      var data = { username: user.username, email: user.email, age: user.age, phone: user.phone ? user.phone : 'Chưa có', blog_counter: user.blog_counter, user_bio: user.user_bio ? user.user_bio : 'Chưa có', slug: user.slug }

      // return res.render('user', { username: req.session.username ? req.session.username : 'Người lạ', data: data })

      return res.render('user', { data: data })
    }).catch(next)
})

// EDIT USER
router.post('/:slug/edit', (req, res, next) => {
  // var data = {phone: req.body.phone, user_bio: req.body.user_bio}
  Users.findOne({ slug: req.params.slug })
    .then(user => {
      var data = { ...user._doc, phone: req.body.phone, user_bio: req.body.user_bio };
      user.delete();
      // Users.delete(user);
      new Users(data).save().then(res.redirect('/'))

    })
    .catch(next)
})

router.get('/:slug/edit', (req, res, next) => {
  Users.findOne({ slug: req.params.slug })
    .then(user => {
      if (!user) {
        return res.send('404 Not found');
      }

      var data = { slug: user.slug, username: user.username, email: user.email, age: user.age, phone: user.phone ? user.phone : 'Chưa có', blog_counter: user.blog_counter, user_bio: user.user_bio ? user.user_bio : 'Chưa có', slug: user.slug }
      // console.log(user.slug)
      // return res.render('user', { username: req.session.username ? req.session.username : 'Người lạ', data: data })

      return res.render('edit', { data: data })
    }).catch(next)
  // res.render('edit')
})

// router

module.exports = router;

