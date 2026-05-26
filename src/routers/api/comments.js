const express = require('express')

const auth = require('../../middlewares/auth')
const commentsService = require('../../services/commentService')
const logger = require('../../utils/logger')

const router = new express.Router()

router.post('/blogs/:id/comments', auth, async (req, res) => {
  try {
    logger.debug('api-comments-router', 'Creating comment', { blogId: req.params.id, userId: req.user._id })
    await commentsService.createComment({
      ...req.body,
      postID: req.params.id,
      owner: req.user._id,
      author: req.user.name
    })
    res.status(201).json({ success: true })
  } catch (e) {
    logger.error('api-comments-router', 'Error creating comment', { blogId: req.params.id, error: e.message })
    res.status(500).json({ error: e.message })
  }
})

router.put('/comments/:id', auth, async (req, res) => {
  try {
    logger.debug('api-comments-router', 'Updating comment', { commentId: req.params.id, userId: req.user._id })
    await commentsService.updateComment(req.params.id, req.user._id, req.body.text)
    res.json({ success: true })
  } catch (e) {
    logger.error('api-comments-router', 'Error updating comment', { commentId: req.params.id, error: e.message })
    res.status(400).json({ error: e.message })
  }
})

router.delete('/comments/:id', auth, async (req, res) => {
  try {
    logger.debug('api-comments-router', 'Deleting comment', { commentId: req.params.id, userId: req.user._id })
    await commentsService.deleteComment(req.params.id, req.user._id)
    res.json({ success: true })
  } catch (e) {
    logger.error('api-comments-router', 'Error deleting comment', { commentId: req.params.id, error: e.message })
    res.status(400).json({ error: e.message })
  }
})

module.exports = router
