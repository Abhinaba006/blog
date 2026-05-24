const User = require('../models/user')
const Blogs = require('../models/blog')

const createUser = async (userData) => {
  const user = new User(userData)
  await user.save()
  const token = await user.generateAuthToken()
  return { user, token }
}

const loginUser = async (email, password) => {
  const user = await User.findByCredentials(email, password)
  const token = await user.generateAuthToken()
  return { user, token }
}

const getProfile = async (userId) => {
  const [publishedBlogs, draftBlogs] = await Promise.all([
    Blogs.find({ owner: userId, published: true }),
    Blogs.find({ owner: userId, published: false })
  ])

  return { publishedBlogs, draftBlogs }
}

const getAllUsers = async () => {
  return User.find({})
}

const getUserProfile = async (userId, currentUserId) => {
  const user = await User.findOne({ _id: userId })
  if (!user) {
    throw new Error('User not found')
  }

  const publishedBlogs = await Blogs.find({ owner: user._id, published: true })
  const isEditable = user._id.toString() === currentUserId.toString()
  let draftBlogs = false

  if (isEditable) {
    draftBlogs = await Blogs.find({ owner: user._id, published: false })
  }

  return {
    name: user.name,
    email: user.email,
    publishedBlogs,
    draftBlogs,
    isEditable
  }
}

const logoutUser = async (user, token) => {
  user.tokens = user.tokens.filter((existingToken) => existingToken.token !== token)
  await user.save()
}

module.exports = {
  createUser,
  loginUser,
  getProfile,
  getAllUsers,
  getUserProfile,
  logoutUser
}
