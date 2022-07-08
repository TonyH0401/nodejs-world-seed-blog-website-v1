var express = require('express');
const Blogs = require('../models/Blogs');
var router = express.Router();

const pathapi = require('path');
const fileapi = require("../libs/libfiles")
const allow_extension = ["png", "jpg", "gif", "jpeg", "txt"]
const upload_dir = pathapi.join(__dirname, "../uploads")
const multiparty = require('multiparty');


function normalizeDate(date) {
	var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return month[date.getMonth() - 1] + ' ' + date.getDate() + ', ' + date.getFullYear();
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
	if (!req.session.user) {
		return res.redirect('/users/login');
	}

	res.render('create', {status: 'Đăng Xuất'});
})


router.post('/create', (req, res) => {
	const form = new multiparty.Form()
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.render("create", { message: err.message, ...fields })
		}
		
		if (!files.photo || files.photo.length == 0) {
			return res.render("create", { message: "Chưa chọn file hình", ...fields });
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

		var user = req.session.user;

		var author = {
				username: user.username,
				avatar: user.avatar,
				personal_concept: user.personal_concept,
				main_color: user.main_color,
				user_bio: user.user_bio,
				slug: user.slug,
		}
		

		var myPost = {
			author: author,
			title: fields.title[0],
			image: filename,
			description: fields.description[0],
			type: fields.type[0],
			content: fields.content[0]
		}

		new Blogs(myPost).save().then(res.redirect('/'));
	})
})


router.get('/:slug', (req, res, next) => {
	Blogs.findOne({ slug: req.params.slug })
		// đây gọi là promises
		.then(blog => {
			if (!blog) {
				return res.render('blogs', { msg: "Không tìm thấy bài đăng này" });
			}

			var data = { author: blog.author, type: blog.type, image: blog.image, title: blog.title, content: blog.content, createdAt: normalizeDate(blog.createdAt) };

			return res.render('blog-single', { 
				layouts: true, 
				concept: blog.author.personal_concept,
				main_color: blog.author.main_color,
				avatar: blog.author.avatar,
				username: req.session.user ? req.session.user.username : "Người lạ",
				bloggerName: blog.author.username,
				bloggerSlug: blog.author.slug,
				data: data,
			})
		})
		.catch(next);
})

module.exports = router;

