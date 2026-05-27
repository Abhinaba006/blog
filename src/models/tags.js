const mongoose = require('mongoose')

const tagsSchema = {
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  createdBy: {
    type: mongoose.Schema.Types.String,
    required: true,
    ref: 'users'
  },
  createdAt: {
    type: Date,
    default: Date.now
    }
};

module.exports = mongoose.model('Tags', tagsSchema)