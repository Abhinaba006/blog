const express = require('express')
const router = new express.Router();
const path = require('path')
const auth = require('../middlewares/auth.js')
const public = path.join(__dirname, '../public')


router.get('/chat', auth, (req, res) => {
    const name = req.user.name
    // console.log(name)
    res.render('chat', {
        name
    })
})

module.exports = router