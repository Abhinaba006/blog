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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    author: {
        type: mongoose.Schema.Types.String,
        required: true,
        ref: 'user'
    },
    published:{
        type:Boolean,
        required:true,
        default:false
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }]
})

BlogsSchema.set('timestamps', true)
const Blogs = mongoose.model('Blogs', BlogsSchema)
module.exports = Blogs