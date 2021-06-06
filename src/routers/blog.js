const express = require('express')
const Blogs = require('../models/blog')
const router = new express.Router()
const auth = require('../middlewares/auth')

// render the home page
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
// save new post
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
// delete a blog, do it in ajax
router.delete('/blogs/:id', auth, async(req, res)=>{
    try{
        console.log(req.params.id)
        const blog = await Blogs.findOneAndDelete({
            _id:req.params.id,
            owner:req.user.id
        })
        if(!blog)
        res.send()
    }catch(e){
        // console.log(e)
        res.status(501).send()
    }
})

module.exports = router