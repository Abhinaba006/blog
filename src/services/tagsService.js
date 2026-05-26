const Tags = require('../models/tags')
const Blogs = require('../models/blog')
const logger = require('../utils/logger')

const getTags = async () => {
  logger.debug('tag-service', 'Fetching all tags')
  return Tags.find()
}

const getTagById = async (id) => {
  logger.debug('tag-service', 'Fetching tag by ID', { id })
  return Tags.findById(id)
}

const getTagByName = async (name) => {
  logger.debug('tag-service', 'Fetching tag by name', { name })
  return Tags.findOne({ name })
}

const resolveExistingTagIds = async (tagInput) => {
  const tagNames = Array.isArray(tagInput) ? tagInput : [tagInput]
  const normalizedNames = [...new Set(tagNames
    .map((tag) => (tag || '').toString().trim())
    .filter((tag) => tag.length > 0))]

  const tagIds = []
  const notFound = []
  
  for (const name of normalizedNames) {
    const tag = await getTagByName(name)
    if (!tag) {
      notFound.push(name)
    } else {
      tagIds.push(tag._id)
    }
  }

  if (notFound.length > 0) {
    throw new Error(`Tag(s) not found: ${notFound.join(', ')}. Please create tags first in the Tags section.`)
  }

  return tagIds
}

const createTag = async (data) => {
  logger.debug('tag-service', 'Creating new tag', { name: data.name })
  const tag = new Tags({
    name: data.name
  })

  if (!tag.name || tag.name.trim() === '') {
    logger.warn('tag-service', 'Tag name is required')
    throw new Error('Tag name is required')
  }

  const existingTag = await getTagByName(tag.name)

  if (existingTag) {
    logger.warn('tag-service', 'Tag with this name already exists', { name: tag.name })
    throw new Error('Tag with this name already exists')
  }

  logger.debug('tag-service', 'Saving new tag', { name: tag.name })
  return tag.save()
}

const updateTag = async (id, data) => {
  logger.debug('tag-service', 'Updating tag', { id, data })
  return Tags.findByIdAndUpdate(id, data, { new: true })
}

const deleteTag = async (id) => {
  try {
    logger.debug('tag-service', 'Deleting tag and clearing references from blogs', { id })

    await Blogs.updateMany(
      { tags: id },
      { $pull: { tags: id } }
    )

    const deletedTag = await Tags.findByIdAndDelete(id)

    if (!deletedTag) {
      logger.warn('tag-service', 'Tag not found for deletion', { id })
      return null
    }

    logger.info('tag-service', 'Tag deleted and removed from related blogs', { id })
    return deletedTag
  } catch (error) {
    logger.error('tag-service', 'Error deleting tag', { id, error: error.message })
    throw error
  }
}

module.exports = {
  getTags,
  getTagById,
  resolveExistingTagIds,
  createTag,
  updateTag,
  deleteTag
}