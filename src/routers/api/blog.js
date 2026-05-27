const express = require('express')

const auth = require('../../middlewares/auth')
const blogService = require('../../services/blogService')
const logger = require('../../utils/logger')

const router = new express.Router()

router.get('/blogs', auth, async (req, res) => {
  try {
    logger.debug('api-blog-router', 'Fetching published blogs')
    const blogs = await blogService.getPublishedBlogs()
    res.json({ blogs })
  } catch (error) {
    logger.error('api-blog-router', 'Error fetching published blogs', { error: error.message })
    res.status(500).json({ error: error.message })
  }
})

router.get('/blogs/:id', auth, async (req, res) => {
  try {
    logger.debug('api-blog-router', 'Fetching blog with comments', { blogId: req.params.id })
    const { blog, comments } = await blogService.getBlogWithComments(req.params.id)
    res.json({ blog, comments })
  } catch (error) {
    logger.error('api-blog-router', 'Error fetching blog', { blogId: req.params.id, error: error.message })
    res.status(404).json({ error: error.message })
  }
})

router.post('/blogs', auth, async (req, res) => {
  try {
    logger.debug('api-blog-router', 'Creating new blog', { title: req.body.title, userId: req.user._id })
    const blog = await blogService.createBlog({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags,
      published: req.body.published,
      owner: req.user._id,
      author: req.user.name
    })
    logger.info('api-blog-router', 'Blog created successfully', { blogId: blog._id, userId: req.user._id })
    res.status(201).json({ blog })
  } catch (error) {
    logger.error('api-blog-router', 'Error creating blog', { userId: req.user._id, error: error.message })
    res.status(400).json({ error: error.message })
  }
})

router.put('/blogs/:id', auth, async (req, res) => {
  try {
    const blog = await blogService.updateBlog(req.params.id, {
      title: req.body.title,
      text: req.body.text,
      tagsName: req.body.tags,
      published: req.body.published
    })
    res.json({ blog })
  } catch (error) {
    logger.error('api-blog-router', 'Error updating blog', { blogId: req.params.id, error: error.message })
    res.status(400).json({ error: error.message })
  }
})

router.delete('/blogs/:id', auth, async (req, res) => {
  try {
    await blogService.deleteBlog(req.params.id, req.user._id)
    res.json({ success: true })
  } catch (error) {
    logger.error('api-blog-router', 'Error deleting blog', { blogId: req.params.id, error: error.message })
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
