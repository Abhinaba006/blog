const mongoose = require('mongoose')

const BlogsSchema = new mongoose.Schema({
    title: {
        type: String,
        default: true,
    },
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
        // default: '000',
        ref: 'user'
    },
    author: {
        type: mongoose.Schema.Types.String,
        required: true,
        // default: 'Anonyomus',
        ref: 'user'
    },
    published:{
        type:Boolean,
        required:true,
        default:false
    }
})

BlogsSchema.set('timestamps', true)
const Blogs = mongoose.model('Blogs', BlogsSchema)
module.exports = Blogs