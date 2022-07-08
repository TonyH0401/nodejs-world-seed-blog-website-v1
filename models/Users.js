const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = new Schema(
    {
        username: {type: String, require: true},
        email: {type: String, require: true},
        age: Number,
        password: {type: String, require: true}
    }
)

module.exports = mongoose.model('Users', Users);