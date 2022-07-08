const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const Users = new Schema(
    {
        username: { type: String, require: true },
        email: { type: String, require: true },
        age: Number,
        password: { type: String, require: true },
        phone: { type: String },
        blog_counter: { type: Number },
        user_bio: { type: String },
        avatar: { type: String },
        slug: { type: String, slug: 'username', sparse: true }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Users', Users);