const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'users'
    },
    author: {
        type: mongoose.Schema.Types.String,
        required: true,
        ref: 'users'
    },
    postID:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'blogs'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

commentSchema.set('timestamps', true)
const Comments = mongoose.model('Comments', commentSchema)
module.exports = Comments