const express = require('express')
const auth = require('../middlewares/auth')
const Blogs = require('../models/blog')
const User = require('../models/user')
const router = new express.Router()

//route for creating user
router.post('/user', async(req, res) => {
    const temp = User.findOne({ email: req.body.email })
    const user = new User(req.body)
        // console.log(user)
    try {
        const result = await user.save()
        const token = await user.generateAuthToken()
        res.cookie('token', token, {
            httpOnly: true,
        })
        res.status(201).redirect('/')
            // res.status(201).send({ result, token })
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
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken();
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
    const { name, email, _id } = req.user
    const blogs = await Blogs.find({
        owner: _id,
        published: true
    })
    const blogs_n = await Blogs.find({
        owner: _id,
        published: false
    })
    res.render('profile', {
        name,
        email,
        blogs,
        blogs_n,
        isEditable: true
    })
})

router.get('/users', auth, async(req, res) => {
    const users = await User.find({})
    res.render('users', {
        users
    })
})

router.get('/users/:id', auth, async(req, res) => {
    const user = await User.findOne({
        _id: req.params.id
    })

    const blogs = await Blogs.find({
        owner: user._id,
        published: true
    })
    let blogs_n = false
    const isEditable = user._id.toString() === req.user._id.toString()
    if (isEditable) {
        blogs_n = await Blogs.find({
            owner: user._id,
            published: false
        })
    }
    const { name, email } = user

    res.render('profile', {
        name,
        email,
        blogs,
        blogs_n,
        isEditable
    })
})

router.get('/user/logout', auth, async(req, res) => {
    try {
        res.clearCookie('token');
        req.user.tokens = req.user.tokens.filter((token) => token.token != req.token)
        await req.user.save()
        res.redirect('/')
    } catch (error) {
        res.send(error)
    }
})

module.exports = router