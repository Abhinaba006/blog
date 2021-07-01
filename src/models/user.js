const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Blogs = require('../models/blog')
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        unique: true,
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Not a email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})




//this delete the extra info before converting to json
UserSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()
    delete userObj.tokens
    delete userObj.password
    // delete userObj._id
    delete userObj.__v
    return userObj
}

UserSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY)

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}
UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    
    if (!user)
        throw new Error('No user found')
    // console.log(user.email)
    const isMatch = await bcrypt.compare(password, user.password)
    // console.log(password)
    if (!isMatch)
        throw new Error('password bhulis kemne?')
    return user
}

UserSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10)
    }
    next()
})
UserSchema.index({ username: 1, email: 1 }, { unique: true }); // forcing for unique
const User = mongoose.model('User', UserSchema)
// User.createIndexes();
module.exports = User