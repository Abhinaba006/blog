const express = require('express')

const auth = require('../../middlewares/auth')
const userService = require('../../services/userService')
const logger = require('../../utils/logger')

const router = new express.Router()

router.post('/users', async (req, res) => {
  try {
    logger.debug('api-user-router', 'Creating new user', { email: req.body.email })
    const { user, token } = await userService.createUser(req.body)
    res.cookie('token', token, { httpOnly: true })
    logger.info('api-user-router', 'User created successfully', { email: req.body.email })
    res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email }, token })
  } catch (e) {
    logger.error('api-user-router', 'Error creating user', { email: req.body.email, error: e.message })
    res.status(400).json({ error: e.message })
  }
})

router.post('/auth/login', async (req, res) => {
  try {
    logger.debug('api-user-router', 'User login attempt', { email: req.body.email })
    const { user, token } = await userService.loginUser(req.body.email, req.body.password)
    res.cookie('token', token, { httpOnly: true })
    logger.info('api-user-router', 'User logged in successfully', { email: req.body.email })
    res.json({ user: { _id: user._id, name: user.name, email: user.email }, token })
  } catch (e) {
    logger.warn('api-user-router', 'Login failed', { email: req.body.email, error: e.message })
    res.status(400).json({ error: "Invalid email or password" })
  }
})

router.get('/users/me', auth, async (req, res) => {
  try {
    logger.debug('api-user-router', 'Fetching authenticated user profile', { userId: req.user._id })
    const { name, email } = req.user
    const { publishedBlogs, draftBlogs } = await userService.getProfile(req.user._id)
    logger.info('api-user-router', 'Profile fetched successfully', { userId: req.user._id, email })
    res.json({ name, email, publishedBlogs, draftBlogs })
  } catch (e) {
    logger.error('api-user-router', 'Error fetching profile', { userId: req.user._id, error: e.message })
    res.status(500).json({ error: e.message })
  }
})

router.get('/users', auth, async (req, res) => {
  try {
    logger.debug('api-user-router', 'Fetching all users')
    const users = await userService.getAllUsers()
    res.json({ users })
  } catch (e) {
    logger.error('api-user-router', 'Error fetching users', { error: e.message })
    res.status(500).json({ error: e.message })
  }
})

router.get('/users/:id', auth, async (req, res) => {
  try {
    logger.debug('api-user-router', 'Fetching user profile by ID', { targetUserId: req.params.id, requesterId: req.user._id })
    const profile = await userService.getUserProfile(req.params.id, req.user._id)
    logger.info('api-user-router', 'User profile fetched', { targetUserId: req.params.id })
    res.json(profile)
  } catch (e) {
    logger.error('api-user-router', 'Error fetching user profile', { targetUserId: req.params.id, error: e.message })
    res.status(404).json({ error: e.message })
  }
})

router.post('/auth/logout', auth, async (req, res) => {
  try {
    logger.info('api-user-router', 'Logging out user', { userId: req.user._id, email: req.user.email })
    res.clearCookie('token')
    await userService.logoutUser(req.user, req.token)
    res.json({ success: true })
  } catch (error) {
    logger.error('api-user-router', 'Error during logout', { userId: req.user._id, error: error.message })
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
