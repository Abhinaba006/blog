// const { nextTick } = require("process")
const jwt = require('jsonwebtoken')
const User = require("../models/user")

const auth = async (req, res, next) => {
    const { token } = req.cookies
    try {
        // console.log('hi')
        // console.log(req.header('Authorization'))

        // console.log(token)
        const decode = jwt.verify(token, process.env.SECRET_KEY)
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })

        console.log(user)
        if (!user) {
            throw new Error('error')
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        console.log(e)
        res.render('login',{
            msg:'please login or sign up '
        })
    }
}

module.exports = auth