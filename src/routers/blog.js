const express = require('express')
const Blogs = require('../models/blog')
const router = new express.Router()
const auth = require('../middlewares/auth')


router.get('/', auth, async (req, res) => {
    try {
        // blogs = await Blogs.find({owner:req.user._id})
        blogs = await Blogs.find({})
        res.render('index', {
            blogs,
            // author:req.user.name
        })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/blogs', auth, async (req, res) => {
    console.log(req.body)
    const authenticated = true
    const blog = new Blogs({
        ...req.body,
        authenticated,
        owner: req.user._id,
        author: req.user.name
    })
    try {
        result = await blog.save()
        res.redirect('/')
    } catch (error) {
        res.status(400).send()
    }
})

module.exports = router