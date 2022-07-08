var express = require('express');
var router = express.Router();
const Users = require('../models/Users');
const Blogs = require('../models/Blogs');



function normalizeDate(date) {
	var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return month[date.getMonth() - 1] + ' ' + date.getDate() + ', ' + date.getFullYear();
}

/* GET home page. */
router.get('/', (req, res, next) => {
	Blogs.find({})
		.then((blogs) => {

			if (blogs.length == 0) {
				console.log('yes');
				return res.render('index');
			}

			var data = blogs.map(blog => {
				return {
					author: blog.author,
					title: blog.title,
					description: blog.description,
					content: blog.content,
					type: blog.type,
					image: blog.image,
					createdAt: normalizeDate(blog.createdAt),
					slug: blog.slug
				}
			})

			var len = data.length;
			var slides = {
				top1: data[len - 1],
				top2: data[len - 2],
				top3: data[len - 3]
			}

			var randomBlogger = data[Math.round(Math.random() * (len - 1))].author;

			var current_user = req.session.user;
			return res.render('index', {
				layouts: true,
				sidebars: false,
				slides: slides,
				slug: current_user ? current_user.slug : '',
				status: current_user ? 'Đăng Xuất' : 'Đăng Nhập',
				username: current_user ? current_user.username : 'Người lạ',
				bloggerName: randomBlogger.username,
				bloggerSlug: randomBlogger.slug,
				avatar: randomBlogger.avatar,
				main_color: current_user ? current_user.main_color : 'black',
				concept: 'World Seed',
				data: data.reverse(),
			})
		})
		.catch(next);
});



module.exports = router;
