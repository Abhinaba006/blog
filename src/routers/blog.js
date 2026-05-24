const express = require('express')
const blogService = require('../services/blogService')
const router = new express.Router()
const auth = require('../middlewares/auth')
router.get('/', auth, async (req, res) => {
    const userid = req.user._id
    try {
        const blogs = await blogService.getPublishedBlogs()
        res.render('index', {
            blogs,
            userid
        })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/blogs/:id', auth, async (req, res) => {
    try {
        const { blog, comments } = await blogService.getBlogWithComments(req.params.id)
        const userID = req.user._id
        res.render('blog', {
            blog,
            comments,
            userID
        })
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.get('/post', auth, async (req, res) => {
    res.render('newPost', {

    })
})

// router for editing post
router.get('/editpost/:id', auth, async (req, res) => {
    try {
        const blog = await blogService.getBlogForEdit(req.params.id)
        res.render('editpost', {
            blog,
        })
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.post('/editpost/:id', auth, async (req, res) => {
    try {
        await blogService.updateBlog(req.params.id, {
            title: req.body.title,
            text: req.body.text,
            published: req.body.published
        })
        res.redirect('/')
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})


router.post('/blogs', auth, async (req, res) => {
    try {
        await blogService.createBlog({
            title: req.body.title,
            text: req.body.text,
            published: req.body.published,
            owner: req.user._id,
            author: req.user.name
        })
        res.redirect('/')
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})

router.delete('/blogs/:id', auth, async (req, res) => {
    try {
        const blog = await blogService.deleteBlog(req.params.id, req.user.id)
        if (!blog) {
            return res.send()
        }
        res.send()
    } catch (e) {
        res.status(501).send()
    }
})

module.exports = router