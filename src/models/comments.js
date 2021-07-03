const mongoose = require('mongoose')
const Blogs = require('./blog')

const commentSchema = new mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    author: {
        type: mongoose.Schema.Types.String,
        required: true,
        ref: 'user'
    },
    postID:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'blog'
    }
})

commentSchema.set('timestamps', true)
const Comments = mongoose.model('Comments', commentSchema)
module.exports = Comments