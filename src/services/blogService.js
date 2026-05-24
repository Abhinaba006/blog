const Blogs = require('../models/blog')
const Comments = require('../models/comments')

const getPublishedBlogs = async () => {
  return Blogs.find({ published: true })
}

const getBlogById = async (id) => {
  return Blogs.findOne({ _id: id })
}

const getBlogWithComments = async (id) => {
  const blog = await getBlogById(id)
  if (!blog) {
    throw new Error('Blog not found')
  }
  const comments = await Comments.find({ postID: blog._id })
  return { blog, comments }
}

const getBlogForEdit = async (id) => {
  return getBlogById(id)
}

const updateBlog = async (id, data) => {
  const blog = await getBlogById(id)
  if (!blog) {
    throw new Error('Blog not found')
  }

  blog.text = data.text
  blog.title = data.title
  blog.published = data.published ? true : false

  if (!blog.text || !blog.title) {
    throw new Error('Title and text are required')
  }

  return blog.save()
}

const createBlog = async (data) => {
  const blog = new Blogs({
    title: data.title,
    text: data.text,
    published: data.published ? true : false,
    owner: data.owner,
    author: data.author
  })

  if (!blog.title) {
    throw new Error('Title is required')
  }

  if (!blog.text) {
    throw new Error('Text is required')
  }

  return blog.save()
}

const deleteBlog = async (id, ownerId) => {
  const blog = await Blogs.findOneAndDelete({
    _id: id,
    owner: ownerId,
  })

  if (blog) {
    await Comments.deleteMany({ postID: blog._id })
  }

  return blog
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
