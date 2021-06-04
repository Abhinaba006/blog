const mongoose = require('mongoose')

const BlogsSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    // author is the one who is loggedin
    // author:{
    //     type: String,
    // },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    author: {
        type: mongoose.Schema.Types.String,
        required: true,
        default: 'Anonyomus',
        ref: 'user'
    },
})

const Blogs = mongoose.model('Blogs', BlogsSchema)
module.exports = Blogs