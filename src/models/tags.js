const mongoose = require('mongoose')

const TagsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
})

TagsSchema.index({ name: 1 }, { unique: true })

module.exports = mongoose.model('Tag', TagsSchema)