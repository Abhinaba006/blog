const Blogs = require('../models/blog')
const Comments = require('../models/comments')
const tagService = require('./tagsService')
const logger = require('../utils/logger')

const getPublishedBlogs = async () => {
  try {
    logger.debug('blog-service', 'Fetching published blogs')
    const blogs = await Blogs.find({ published: true }).populate('tags')
    logger.info('blog-service', 'Published blogs fetched', { count: blogs.length })
    return blogs
  } catch (error) {
    logger.error('blog-service', 'Error fetching published blogs', { error: error.message })
    throw error
  }
}

const getBlogById = async (id) => {
  return Blogs.findOne({ _id: id }).populate('tags')
}

const getBlogWithComments = async (id) => {
  try {
    logger.debug('blog-service', 'Fetching blog with comments', { blogId: id })
    const blog = await getBlogById(id)
    if (!blog) {
      logger.warn('blog-service', 'Blog not found', { blogId: id })
      throw new Error('Blog not found')
    }
    const comments = await Comments.find({ postID: blog._id })
    logger.info('blog-service', 'Blog with comments fetched', { blogId: id, commentCount: comments.length })
    return { blog, comments }
  } catch (error) {
    logger.error('blog-service', 'Error fetching blog with comments', { blogId: id, error: error.message })
    throw error
  }
}

const getBlogForEdit = async (id) => {
  return getBlogById(id)
}

const updateBlog = async (id, data) => {
  try {
    logger.debug('blog-service', 'Updating blog', { blogId: id, title: data.title })
    const blog = await getBlogById(id)
    if (!blog) {
      logger.warn('blog-service', 'Blog not found for update', { blogId: id })
      throw new Error('Blog not found')
    }

    blog.text = data.text
    blog.title = data.title
    blog.published = data.published ? true : false
    blog.tags = data.tags || []

    if (!blog.text || !blog.title) {
      logger.warn('blog-service', 'Invalid blog data', { blogId: id })
      throw new Error('Title and text are required')
    }

    const updatedBlog = await blog.save()
    logger.info('blog-service', 'Blog updated successfully', { blogId: id })
    return updatedBlog
  } catch (error) {
    logger.error('blog-service', 'Error updating blog', { blogId: id, error: error.message })
    throw error
  }
}

const createBlog = async (data) => {
  try {
    logger.debug('blog-service', 'Creating new blog', { title: data.title, author: data.author })
    
    let tags = []
    if (data.tags && data.tags.length > 0) {
      tags = await tagService.resolveExistingTagIds(data.tags)
    }

    const blog = new Blogs({
      title: data.title,
      text: data.text,
      published: data.published ? true : false,
      tags,
      owner: data.owner,
      author: data.author
    })

    if (!blog.title) {
      logger.warn('blog-service', 'Blog title is required', { author: data.author })
      throw new Error('Title is required')
    }

    if (!blog.text) {
      logger.warn('blog-service', 'Blog text is required', { title: data.title })
      throw new Error('Text is required')
    }

    const newBlog = await blog.save()
    await newBlog.populate('tags')
    logger.info('blog-service', 'Blog created successfully', { blogId: newBlog._id, title: data.title })
    return newBlog
  } catch (error) {
    logger.error('blog-service', 'Error creating blog', { title: data.title, error: error.message })
    throw error
  }
}

const deleteBlog = async (id, ownerId) => {
  try {
    logger.debug('blog-service', 'Deleting blog', { blogId: id, ownerId })
    const blog = await Blogs.findOneAndDelete({
      _id: id,
      owner: ownerId,
    })

    if (blog) {
      await Comments.deleteMany({ postID: blog._id })
      logger.info('blog-service', 'Blog deleted successfully', { blogId: id })
    } else {
      logger.warn('blog-service', 'Blog not found or unauthorized delete', { blogId: id, ownerId })
    }

    return blog
  } catch (error) {
    logger.error('blog-service', 'Error deleting blog', { blogId: id, error: error.message })
    throw error
  }
}

module.exports = {
  getPublishedBlogs,
  getBlogById,
  getBlogWithComments,
  getBlogForEdit,
  updateBlog,
  createBlog,
  deleteBlog
}
