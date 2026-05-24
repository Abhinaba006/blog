const express = require('express')
const commentsService = require('../services/commentService')

const router = new express.Router()
const auth = require('../middlewares/auth')
console.log('blog')
router.post('/blogs/comment/:id', auth, async (req, res) => {
    const backURL = req.header('Referer') || '/';
    try {
        await commentsService.createComment({
            ...req.body,
            owner: req.user.id,
            author: req.user.name
        })
        res.redirect(backURL)

    }
    catch(e){
        res.send(e)
    }
})

module.exports = router