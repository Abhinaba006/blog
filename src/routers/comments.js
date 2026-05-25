const express = require('express')
const commentsService = require('../services/commentService')
const logger = require('../utils/logger')

const router = new express.Router()
const auth = require('../middlewares/auth')
router.post('/blogs/comment/:id', auth, async (req, res) => {
    const backURL = req.header('Referer') || '/';
    try {
        logger.debug('comments-router', 'Creating comment', { blogId: req.params.id, userId: req.user.id })
        await commentsService.createComment({
            ...req.body,
            owner: req.user.id,
            author: req.user.name
        })
        logger.info('comments-router', 'Comment created successfully', { blogId: req.params.id, userId: req.user.id })
        res.redirect(backURL)

    }
    catch(e){
        logger.error('comments-router', 'Error creating comment', { blogId: req.params.id, error: e.message })
        res.status(500).json({ error: e.message })
    }
})

router.put('/blogs/comment/:id', auth, async (req, res) => {
    try {
        logger.debug('comments-router', 'Updating comment', { commentId: req.params.id, userId: req.user.id })
        await commentsService.updateComment(req.params.id, req.user.id, req.body.text)
        logger.info('comments-router', 'Comment updated successfully', { commentId: req.params.id, userId: req.user.id })
        res.json({ success: true })
    } catch (e) {
        logger.error('comments-router', 'Error updating comment', { commentId: req.params.id, error: e.message })
        res.status(400).json({ error: e.message })
    }
})

router.delete('/blogs/comment/:id', auth, async (req, res) => {
    try {
        logger.debug('comments-router', 'Deleting comment', { commentId: req.params.id, userId: req.user.id })
        await commentsService.deleteComment(req.params.id, req.user.id)
        logger.info('comments-router', 'Comment deleted successfully', { commentId: req.params.id, userId: req.user.id })
        res.json({ success: true })
    } catch (e) {
        logger.error('comments-router', 'Error deleting comment', { commentId: req.params.id, error: e.message })
        res.status(400).json({ error: e.message })
    }
})

module.exports = router