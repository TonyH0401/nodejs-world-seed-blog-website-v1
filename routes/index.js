var express = require('express');
var router = express.Router();
const Users = require('../models/Users');
const Blogs = require('../models/Blogs');
const { normalizeDate } = require('../libs/functions');
const res = require('express/lib/response');

Users.find({}, (err, users) => {
	// console.log(users)
	// console.log(err)
	if (err) {
		return res.json({err: err})
	}
	if (users.length != 0) {
		return
	}
	var default_user = {
		username: "Lê Gia Phú",
		email: "superbop@gmail.com",
		password: 123123,
		dob: new Date(1945, 10, 03),
		phone: "0902-420-6969",
		avatar: "august.png",
		user_bio: "This is my bio",
		personal_concept: "Bóp",
		main_color: "#2155CD",
		blog_counter: 1,
		slug: "le-gia-phu"
	}
	new Users(default_user).save()
})
Blogs.find({}, (err, blogs) => {
	if (err) {
		return res.json({err: err})
	}
	if (blogs.length != 0) {
		return
	}
	var default_blog = {
		author: {
			username: "Lê Gia Phú",
			avatar: "august.png",
			personal_concept: "Bóp",
			main_color: "#2155CD",
			user_bio: "This is my bio",
			authorSlug: "le-gia-phu",
		},
		title: "Ngày đêm tối",
		type: "life",
		content: "Sáng 4/5, Hội nghị Trung ương 5 khóa XIII khai mạc tại Hà Nội. Dự kiến trong 7 ngày, các đại biểu sẽ tập trung thảo luận,",
		image: "darkart.png",
		description: "CAIRO",
		slug: "ngay-dem-toi"
	}
	new Blogs(default_blog).save()
})


/* GET home page. */
router.get('/', (req, res, next) => {
	Blogs.find({})
		.then((blogs) => {
			console.log(blogs);
			if (blogs.length == 0) {
				return res.json({ success: false, msg: 'Chưa có blog' });
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
			console.log(randomBlogger);
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
