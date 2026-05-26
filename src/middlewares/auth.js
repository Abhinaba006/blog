const jwt = require('jsonwebtoken')
const User = require("../models/user")
const logger = require("../utils/logger")

const auth = async (req, res, next) => {
    const { token } = req.cookies
    try {
        logger.debug('auth-middleware', 'Verifying token')
        const decode = jwt.verify(token, process.env.SECRET_KEY)
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })

        if (!user) {
            logger.warn('auth-middleware', 'User not found for token', { userId: decode._id })
            throw new Error('error')
        }

        logger.info('auth-middleware', 'User authenticated successfully', { userId: user._id, email: user.email })
        req.token = token
        req.user = user
        next()
    } catch (e) {
        logger.warn('auth-middleware', 'Authentication failed', { error: e.message })
        if (req.originalUrl && req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({ error: 'Please login or sign up' })
        }
        res.render('login', {
            msg: 'please login or sign up '
        })
    }
}

module.exports = auth