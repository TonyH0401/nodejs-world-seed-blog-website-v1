const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var slug = require('..moongoose-slug-generator');
mongoose.plugin(slug);


const Blogs = new Schema(
    {
        username: {type: String},
        title: String,
        content: String,
        created: Date,
        slug: {type: String, slug: 'username', unique: true}
    }
)
// bên trái là tên, còn cái bên phải làm cái Blogs phía trên
module.exports = mongoose.model('Blogs', Blogs);