const express = require('express')
const auth = require('../middlewares/auth')
const logger = require('../utils/logger')

const router = new express.Router()

router.get('/tags', auth, async (req, res) => {
  try {
    logger.debug('tags-router', 'Rendering tags page', { userId: req.user._id })
    res.render('tags')
  } catch (error) {
    logger.error('tags-router', 'Error rendering tags page', { userId: req.user._id, error: error.message })
    res.status(500).send(error.message)
  }
})

module.exports = router
