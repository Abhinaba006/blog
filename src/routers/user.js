const express = require('express')
const auth = require('../middlewares/auth')
const userService = require('../services/userService')
const router = new express.Router()

//route for creating user
router.post('/user', async(req, res) => {
    try {
        const { token } = await userService.createUser(req.body)
        res.cookie('token', token, {
            httpOnly: true,
        })
        res.status(201).redirect('/')
    } catch (e) {
        console.log(e)
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
        res.clearCookie('token');
        const { token } = await userService.loginUser(req.body.email, req.body.password)
        res.cookie('token', token, {
            httpOnly: true,
        });
        res.redirect('/')
    } catch (e) {
        res.render('signup', {
            msg: "Some thing gone wrong, try again\n" + e
        })
    }
})

// route to read profile
router.get('/user/me', auth, async(req, res) => {
    const { name, email } = req.user
    const { publishedBlogs, draftBlogs } = await userService.getProfile(req.user._id)
    res.render('profile', {
        name,
        email,
        blogs: publishedBlogs,
        blogs_n: draftBlogs,
        isEditable: true
    })
})

router.get('/users', auth, async(req, res) => {
    const users = await userService.getAllUsers()
    res.render('users', {
        users
    })
})

router.get('/users/:id', auth, async(req, res) => {
    try {
        const profile = await userService.getUserProfile(req.params.id, req.user._id)
        res.render('profile', {
            name: profile.name,
            email: profile.email,
            blogs: profile.publishedBlogs,
            blogs_n: profile.draftBlogs,
            isEditable: profile.isEditable
        })
    } catch (e) {
        res.status(404).send({ error: e.message })
    }
})

router.get('/user/logout', auth, async(req, res) => {
    try {
        res.clearCookie('token');
        await userService.logoutUser(req.user, req.token)
        res.redirect('/')
    } catch (error) {
        res.send(error)
    }
})

module.exports = router