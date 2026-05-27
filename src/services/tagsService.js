const Tags = require('../models/tags')
const Blogs = require('../models/blogs')
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

const resolveExistingTagNames = async (tagInput) => {
  logger.debug('tag-service', 'Resolving existing tag names from input', { tagInput })
const tagNames = Array.isArray(tagInput) ? tagInput : [tagInput];
const normalizedNames = [...new Set(tagNames
  .map((tag) => (tag || '').toString().trim())
  .filter((tag) => tag.length > 0))];

const existingTags = await Tags.find({ name: { $in: normalizedNames } });

const existingTagNames = existingTags.map(tag => tag.name);

const notFound = normalizedNames.filter(name => !existingTagNames.includes(name));

  if (notFound.length > 0) {
    logger.warn('tag-service', 'Some tags not found', { notFound })
    throw new Error(`Tag(s) not found: ${notFound.join(', ')}. Please create tags first in the Tags section.`)
  }

  return tagNames
}

const createTag = async (data) => {
  logger.debug('tag-service', 'Creating new tag', { name: data.name })
  // expect s string comma separated list of tags or an array of tag names, normalize to array of trimmed strings
  const tagNames = Array.isArray(data.name) ? data.name : data.name.split(',').map((tag) => tag.trim())
  const createdBy = data.user.name
  const uniqueTagNames = [...new Set(tagNames.filter((tag) => tag.length > 0))]
  //validate
  if (uniqueTagNames.length === 0) {
    logger.warn('tag-service', 'No valid tag names provided')
    throw new Error('At least one valid tag name is required')
  }
 
  const bulkOps = uniqueTagNames.map((name) => ({
    updateOne: {
      filter: { name },
      update: { $setOnInsert: { name, createdBy } },
      upsert: true
    }
  }))

  const bulkWriteResult = await Tags.bulkWrite(bulkOps)
  logger.info('tag-service', 'Bulk upsert completed', { matchedCount: bulkWriteResult.matchedCount, modifiedCount: bulkWriteResult.modifiedCount, upsertedCount: bulkWriteResult.upsertedCount })

  const createdTags = await Tags.find({ name: { $in: uniqueTagNames } })
  return createdTags
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
  resolveExistingTagNames,
  createTag,
  updateTag,
  deleteTag
}