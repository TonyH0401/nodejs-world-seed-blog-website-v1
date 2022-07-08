const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const Blogs = new Schema(
    {
        author: {type: Object}, // Phú Gia Lê -
        title: { type: String, sparse: true },
        type: {type: String},
        content: { type: String, sparse: true },
        image: { type: String, require: true },
        description: { type: String, require: true },
        slug: { type: String, slug: 'title', sparse: true }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Blogs', Blogs);