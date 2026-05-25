const express = require('express')
const blogService = require('../services/blogService')
const router = new express.Router()
const auth = require('../middlewares/auth')
const logger = require('../utils/logger')
router.get('/', auth, async (req, res) => {
    const userid = req.user._id
    try {
        logger.debug('blog-router', 'Fetching published blogs', { userid })
        const blogs = await blogService.getPublishedBlogs()
        logger.info('blog-router', 'Published blogs fetched successfully', { count: blogs.length })
        res.render('index', {
            blogs,
            userid
        })
    } catch (error) {
        logger.error('blog-router', 'Error fetching published blogs', { error: error.message })
        res.status(400).json({ error: error.message })
    }
})

router.get('/blogs/:id', auth, async (req, res) => {
    try {
        logger.debug('blog-router', 'Fetching blog with comments', { blogId: req.params.id })
        const { blog, comments } = await blogService.getBlogWithComments(req.params.id)
        const userID = req.user._id
        logger.info('blog-router', 'Blog fetched successfully', { blogId: req.params.id, commentCount: comments.length })
        res.render('blog', {
            blog,
            comments,
            userID
        })
    } catch (error) {
        logger.error('blog-router', 'Error fetching blog', { blogId: req.params.id, error: error.message })
        res.status(404).json({ error: error.message })
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
        res.status(404).json({ error: error.message })
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
        logger.debug('blog-router', 'Creating new blog', { title: req.body.title, userId: req.user._id })
        await blogService.createBlog({
            title: req.body.title,
            text: req.body.text,
            published: req.body.published,
            owner: req.user._id,
            author: req.user.name
        })
        logger.info('blog-router', 'Blog created successfully', { userId: req.user._id, title: req.body.title })
        res.redirect('/')
    } catch (error) {
        logger.error('blog-router', 'Error creating blog', { userId: req.user._id, error: error.message })
        res.status(400).json({ error: error.message })
    }
})

router.delete('/blogs/:id', auth, async (req, res) => {
    try {
        logger.debug('blog-router', 'Deleting blog', { blogId: req.params.id, userId: req.user.id })
        const blog = await blogService.deleteBlog(req.params.id, req.user.id)
        if (!blog) {
            logger.warn('blog-router', 'Blog not found or unauthorized delete attempt', { blogId: req.params.id, userId: req.user.id })
            return res.json({})
        }
        logger.info('blog-router', 'Blog deleted successfully', { blogId: req.params.id })
        res.json({})
    } catch (e) {
        logger.error('blog-router', 'Error deleting blog', { blogId: req.params.id, error: e.message })
        res.status(501).json({})
    }
})

module.exports = router