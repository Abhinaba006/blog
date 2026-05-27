const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Blogs = require('./blogs')
const UsersSchema = new mongoose.Schema({
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
UsersSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()
    delete userObj.tokens
    delete userObj.password
    // delete userObj._id
    delete userObj.__v
    return userObj
}

UsersSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY)

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}
UsersSchema.statics.findByCredentials = async (email, password) => {
    const user = await Users.findOne({ email })
    
    if (!user)
        throw new Error('No user found')
    // console.log(user.email)
    const isMatch = await bcrypt.compare(password, user.password)
    // console.log(password)
    if (!isMatch)
        throw new Error('password is wrong')
    return user
}

UsersSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10)
    }
    next()
})
UsersSchema.index({ email: 1 }, { unique: true })
const Users = mongoose.model('Users', UsersSchema)
module.exports = Users