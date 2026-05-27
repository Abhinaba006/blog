const User = require('../models/users')
const Blogs = require('../models/blogs')
const logger = require('../utils/logger')

const createUser = async (userData) => {
  try {
    logger.debug('user-service', 'Creating new user', { email: userData.email })
    const user = new User(userData)
    await user.save()
    const token = await user.generateAuthToken()
    logger.info('user-service', 'User created successfully', { userId: user._id, email: userData.email })
    return { user, token }
  } catch (error) {
    logger.error('user-service', 'Error creating user', { email: userData.email, error: error.message })
    throw error
  }
}

const loginUser = async (email, password) => {
  try {
    logger.debug('user-service', 'User login attempt', { email })
    const user = await User.findByCredentials(email, password)
    const token = await user.generateAuthToken()
    logger.info('user-service', 'User logged in successfully', { userId: user._id, email })
    return { user, token }
  } catch (error) {
    logger.warn('user-service', 'Login failed', { email, error: error.message })
    throw error
  }
}

const getProfile = async (userId) => {
  try {
    logger.debug('user-service', 'Fetching user profile', { userId })
    const [publishedBlogs, draftBlogs] = await Promise.all([
      Blogs.find({ owner: userId, published: true }),
      Blogs.find({ owner: userId, published: false })
    ])
    logger.info('user-service', 'User profile fetched', { userId, publishedCount: publishedBlogs.length, draftCount: draftBlogs.length })
    return { publishedBlogs, draftBlogs }
  } catch (error) {
    logger.error('user-service', 'Error fetching profile', { userId, error: error.message })
    throw error
  }
}

const getAllUsers = async () => {
  return User.find({})
}

const getUserProfile = async (userId, currentUserId) => {
  try {
    logger.debug('user-service', 'Fetching user profile by ID', { userId, requesterId: currentUserId })
    const user = await User.findOne({ _id: userId })
    if (!user) {
      logger.warn('user-service', 'User not found', { userId })
      throw new Error('User not found')
    }

    const publishedBlogs = await Blogs.find({ owner: user._id, published: true })
    const isEditable = user._id.toString() === currentUserId.toString()
    let draftBlogs = false

    if (isEditable) {
      draftBlogs = await Blogs.find({ owner: user._id, published: false })
    }

    logger.info('user-service', 'User profile fetched', { userId, email: user.email })
    return {
      name: user.name,
      email: user.email,
      publishedBlogs,
      draftBlogs,
      isEditable
    }
  } catch (error) {
    logger.error('user-service', 'Error fetching user profile', { userId, error: error.message })
    throw error
  }
}

const logoutUser = async (user, token) => {
  try {
    logger.debug('user-service', 'Logging out user', { userId: user._id })
    user.tokens = user.tokens.filter((existingToken) => existingToken.token !== token)
    await user.save()
    logger.info('user-service', 'User logged out successfully', { userId: user._id })
  } catch (error) {
    logger.error('user-service', 'Error logging out user', { userId: user._id, error: error.message })
    throw error
  }
}

module.exports = {
  createUser,
  loginUser,
  getProfile,
  getAllUsers,
  getUserProfile,
  logoutUser
}
