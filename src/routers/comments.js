const express = require('express')
var bodyParser = require('body-parser')

const Blogs = require('../models/blog')
const Comments = require('../models/comments')

const router = new express.Router()
const auth = require('../middlewares/auth')
console.log('blog')
router.post('/blogs/comment/:id', auth, async (req, res) => {
    const backURL = req.header('Referer') || '/';
    console.log(req.body)
    const comment = new Comments({
        ...req.body,
        owner: req.user.id,
        author: req.user.name
    })

    try {
        await comment.save()
        res.redirect(backURL)

    }
    catch(e){
        res.send(e)
    }
})

module.exports = router