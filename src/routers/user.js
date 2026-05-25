const express = require('express')
const auth = require('../middlewares/auth')
const userService = require('../services/userService')
const logger = require('../utils/logger')
const router = new express.Router()

//route for creating user
router.post('/user', async(req, res) => {
    try {
        logger.debug('user-router', 'Creating new user', { email: req.body.email })
        const { token } = await userService.createUser(req.body)
        logger.info('user-router', 'User created successfully', { email: req.body.email })
        res.cookie('token', token, {
            httpOnly: true,
        })
        res.status(201).redirect('/')
    } catch (e) {
        logger.error('user-router', 'Error creating user', { email: req.body.email, error: e.message })
        res.render('signup', {
            msg: "Some thing gone wrong, try again"
        })
    }
})

// route for logging in existing user
router.get('/user/signup', async(req, res) => {
    try {
        res.render('signup')
    } catch (e) {
        res.status(401).send(e)
    }
})

// login user view
router.get('/user/login', async(req, res) => {
    try {
        res.render('login')
    } catch (e) {
        res.status(401).send(e)
    }
})

// login user
router.post('/user/login', async(req, res) => {
    try {
        logger.debug('user-router', 'User login attempt', { email: req.body.email })
        res.clearCookie('token');
        const { token } = await userService.loginUser(req.body.email, req.body.password)
        logger.info('user-router', 'User logged in successfully', { email: req.body.email })
        res.cookie('token', token, {
            httpOnly: true,
        });
        res.redirect('/')
    } catch (e) {
        logger.warn('user-router', 'Login failed', { email: req.body.email, error: e.message })
        res.render('signup', {
            msg: "Some thing gone wrong, try again\n" + e
        })
    }
})

// route to read profile
router.get('/user/me', auth, async(req, res) => {
    try {
        logger.debug('user-router', 'Fetching user profile', { userId: req.user._id })
        const { name, email } = req.user
        const { publishedBlogs, draftBlogs } = await userService.getProfile(req.user._id)
        logger.info('user-router', 'Profile fetched successfully', { userId: req.user._id, email })
        res.render('profile', {
            name,
            email,
            blogs: publishedBlogs,
            blogs_n: draftBlogs,
            isEditable: true,
            isOwner: true
        })
    } catch (e) {
        logger.error('user-router', 'Error fetching profile', { userId: req.user._id, error: e.message })
        res.status(500).send(e)
    }
})

router.get('/users', auth, async(req, res) => {
    const users = await userService.getAllUsers()
    res.render('users', {
        users
    })
})

router.get('/users/:id', auth, async(req, res) => {
    try {
        logger.debug('user-router', 'Fetching user profile', { targetUserId: req.params.id, requesterId: req.user._id })
        const profile = await userService.getUserProfile(req.params.id, req.user._id)
        logger.info('user-router', 'User profile fetched', { targetUserId: req.params.id })
        const isOwner = req.user._id.toString() === req.params.id
        res.render('profile', {
            name: profile.name,
            email: profile.email,
            blogs: profile.publishedBlogs,
            blogs_n: profile.draftBlogs,
            isEditable: isOwner,
            isOwner
        })
    } catch (e) {
        logger.error('user-router', 'Error fetching user profile', { targetUserId: req.params.id, error: e.message })
        res.status(404).json({ error: e.message })
    }
})

router.get('/user/logout', auth, async(req, res) => {
    try {
        logger.info('user-router', 'User logging out', { userId: req.user._id, email: req.user.email })
        res.clearCookie('token');
        await userService.logoutUser(req.user, req.token)
        res.redirect('/')
    } catch (error) {
        logger.error('user-router', 'Error during logout', { userId: req.user._id, error: error.message })
        res.status(500).json({ error: error.message })
    }
})

module.exports = router