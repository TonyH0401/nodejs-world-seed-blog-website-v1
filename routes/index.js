var express = require('express');
var router = express.Router();
const Users = require('../models/Users');
const Blogs = require('../models/Blogs');
const fs = require('fs');
const pathapi = require('path');
const fileapi = require("../libs/libfiles")
const allow_extension = ["png", "jpg", "gif", "jpeg", "txt"]
const upload_dir = pathapi.join(__dirname, "../uploads")
const Resize = require('../libs/Resize');

function normalizeDate(date) {
	return date.getDate() + ' tháng ' + date.getMonth() + ' năm ' + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
}

Blogs.find({}, (err, blogs) => {
	if (blogs.length > 0) {
		return;
	}

	var myDefaultBlog = {
		username: "Lê Gia Phú",
		title: 'The Science of Deduction',
		image: 'https://picsum.photos/570/300',
		description: 'This is a small description for this blog. Hope you guys enjoy it ^.^',
		content: 'Sherlock Holmes took his bottle from the corner of the mantel-piece and his hypodermic syringe from its neat morocco case.',
	}

	new Blogs(myDefaultBlog).save();
})


// check session có chưa
router.get('/create', (req, res) => {
	if (!req.session.username) {
		return res.redirect('/login');
	}

	res.render('create', {username: req.session.username, status: 'Đăng Xuất'});
})

const multiparty = require('multiparty');
router.post('/create', (req, res) => {
	const form = new multiparty.Form()
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.render("create", { message: err.message, ...fields })
		}

		if (!files.photo || files.photo.length == 0) {
			return res.render("create", { message: "Chưa chọn file hình", ...fields })
		}


		let path = files.photo[0].path
		let filename = files.photo[0].originalFilename //lấy tên file
		let parts = filename.split('.')
		let ext = parts[parts.length - 1].toLowerCase() //lấy phần mở rộng
		// check xem file ảnh thuộc mảng
		if (!allow_extension.find(s => s == ext)) {
			return res.render("create", { message: "Vui lòng chọn file hình", ...fields })
		}
		//lấy tên upload lên để lưu nhưng sẽ thêm số phía sau nếu trùng tên

		let newname = filename.substr(0, filename.length - ext.length - 1)
		let idx = ""
		//cố định phần mở rộng là png vì người dùng có thể upload 2 file cùng tên khác phần mở rộng thì hệ thống sẽ không thể lưu 2 file ghi chú cùng tên với phần mở rộng là txt được.
		//có thể không cần cố định phần mở rộng bằng cách dùng tên file ngẫu nhiên
		ext = "png"
		filename = newname + '.' + ext
		while (fileapi.isexist(pathapi.join(upload_dir, filename))) {
			if (!idx)
				idx = 1
			else
				idx += 1
			filename = newname + idx.toString() + '.' + ext
			// console.log(upload_dir, filename)
		}
		let newpath = pathapi.join(upload_dir, filename)

		fileapi.move(path, newpath, (err) => {
			if (err)
				return res.render("create", { message: "không thể lưu tập tin: " + err.message, ...fields })
			//lưu ghi chú nếu có
			if (fields.note && fields.note.length > 0 && fields.note[0]) {
				fileapi.writefile(pathapi.join(upload_dir, newname + idx.toString() + '.txt'), fields.note[0], err => {
					if (err)
						console.log('Lưu ghi chú bị lỗi:', err)
				})
			}
		})



		var myPost = {
			author: fields.author[0],
			title: fields.title[0],
			image: filename,
			description: fields.description[0],
			content: fields.content[0]
		}

		new Blogs(myPost).save().then(res.redirect('/'));
	})
})

router.post('/register', (req, res) => {
	var myUser = {
		username: req.body.username,
		email: req.body.email,
		age: req.body.age,
		password: req.body.password,
		phone: null,
		blog_counter: 0,
		user_bio: null,

	}

	Users.findOne({ email: req.body.email }, (err, user) => {
		if (err) {
			return res.render('register', { msg: err })
		}

		if (user) {
			return res.render('register', { msg: 'Tài khoản đã tồn tại' });
		}

		new Users(myUser).save().then(res.redirect('/login'));
	})

})

router.get('/register', (req, res) => {
	res.render('register');
})

router.get('/login', (req, res) => {
	req.session.destroy();
	res.render('login');
})

//redirect là khi không gửi gì gì
//redener là muốn render trang đó với dữ liệu 
router.post('/login', (req, res) => {
	Users.findOne({ username: req.body.username }, (err, user) => {
		if (user) {
			if (user.password == req.body.password) {
				req.session.username = user.username;
				req.session.slug = user.slug;
				console.log('Login Thành công');
				res.redirect('/');
			} else {
				res.render("login", { message: "Sai mật khẩu" })
			}
		}
	})
})


/* GET home page. */
router.get('/', (req, res, next) => {
	Blogs.find({})
		.then((blogs) => {

			var data = blogs.map(blog => {
				return {
					author: blog.author,
					title: blog.title,
					description: blog.description,
					content: blog.content,
					image: blog.image,
					createdAt: normalizeDate(blog.createdAt),
					slug: blog.slug
				}
			})

			return res.render('index', {slug: req.session.slug, status: req.session.username ? 'Đăng Xuất' : 'Đăng Nhập', username: req.session.username ? req.session.username : 'Người lạ', data: data })
		})
		.catch(next);
});

router.get('/:slug', (req, res, next) => {
	Blogs.findOne({ slug: req.params.slug })
		// đây gọi là promises
		.then(blog => {
			if (!blog) {
				return res.render('blogs', { msg: "Không tìm thấy bài đăng này" });
			}

			var data = { author: blog.author, title: blog.title, content: blog.content, createdAt: normalizeDate(blog.createdAt) };

			return res.render('blogs', { username: req.session.username ? req.session.username : 'Người lạ', data: data })
		})
		.catch(next);
})

module.exports = router;
