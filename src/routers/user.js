const express = require('express')
const auth = require('../middlewares/auth')
const Blogs = require('../models/blog')
const User = require('../models/user')
const router = new express.Router()

//route for creating user
router.post('/user', async (req, res) => {
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
router.get('/user/signup', async (req, res) => {
    try {
        res.render('signup')
    } catch (e) {
        res.status(401).send(e)
    }
})

// login user view
router.get('/user/login', async (req, res) => {
    try {
        res.render('login')
    } catch (e) {
        res.status(401).send(e)
    }
})

// login user
router.post('/user/login', async (req, res) => {
    try {
        res.clearCookie('token');
        // console.log(req.body.password)
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken();
        // console.log('hi')
        res.cookie('token', token, {
            httpOnly: true,
        });
        res.redirect('/')
        // res.send('hi')
        // console.log(res.cookie[''])

        // // var redirectTo = req.session.redirectTo || '/';
        // // delete req.session.redirectTo;
        // // // is authenticated ?
        // // res.redirect(redirectTo);
        // res.send({ user, token })
    } catch (e) {
        res.render('signup', {
            msg: "Some thing gone wrong, try again\n" + e
        })
    }
})

// route to read profile
router.get('/user/me', auth, async (req, res) => {
    // const esu = await User.find({})
    const { name, email, _id } = req.user
    const blogs = await Blogs.find({
        owner: _id,
        published: true
    })
    const blogs_n = await Blogs.find({
        owner: _id,
        published: false
    })
    res.render('me', {
        name,
        email,
        blogs,
        blogs_n
    })
})

router.post('/user/logout', auth, async (req, res) => {
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