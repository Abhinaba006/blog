const express = require('express')
const auth = require('../../middlewares/auth')
const tagService = require('../../services/tagsService')
const logger = require('../../utils/logger')

const router = new express.Router()
router.get('/tags', auth, async (req, res) => {
    try {
        logger.debug('api-tags-router', 'Fetching all tags')
        const tags = await tagService.getTags()
        logger.info('api-tags-router', 'Tags fetched successfully', { count: tags.length })
        res.json({ tags })
    } catch (e) {
        logger.error('api-tags-router', 'Error fetching tags', { error: e.message })
        res.status(500).json({ error: e.message })
    }   
})

router.post('/tags', auth, async (req, res) => {
    try {
        logger.debug('api-tags-router', 'Creating new tag', { name: req.body.name })
        const tag = await tagService.createTag({ name: req.body.name, user: req.user })
        logger.info('api-tags-router', 'Tag created successfully', { tagId: tag._id, name: req.body.name })
        res.status(201).json({ tag })
    } catch (e) {
        logger.error('api-tags-router', 'Error creating tag', { name: req.body.name, error: e.message })
        res.status(400).json({ error: e.message })
    }
})

// router.put('/tags/:id', auth, async (req, res) => {
//     try {
//         logger.debug('api-tags-router', 'Updating tag', { tagId: req.params.id, name: req.body.name })
//         const tag = await tagService.updateTag(req.params.id, { name: req.body.name })
//         if (!tag) {
//             logger.warn('api-tags-router', 'Tag not found for update', { tagId: req.params.id })
//             return res.status(404).json({ error: 'Tag not found' })
//         }
//         logger.info('api-tags-router', 'Tag updated successfully', { tagId: req.params.id })
//         res.json({ tag })
//     } catch (e) {
//         logger.error('api-tags-router', 'Error updating tag', { tagId: req.params.id, error: e.message })
//         res.status(400).json({ error: e.message })
//     }
// })

router.delete('/tags/:id', auth, async (req, res) => {
    try {
        logger.debug('api-tags-router', 'Deleting tag', { tagId: req.params.id })
        await tagService.deleteTag(req.params.id)
        logger.info('api-tags-router', 'Tag deleted successfully', { tagId: req.params.id })
        res.json({ success: true })
    }
    catch (e) {
        logger.error('api-tags-router', 'Error deleting tag', { tagId: req.params.id, error: e.message })
        res.status(400).json({ error: e.message })
    }
})

module.exports = router