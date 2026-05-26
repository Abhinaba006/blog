const express = require('express')
const path = require('path')
const hbs = require('hbs')

const mockCreateUser = jest.fn()
const mockLoginUser = jest.fn()
const mockGetProfile = jest.fn()
const mockGetAllUsers = jest.fn()
const mockGetUserProfile = jest.fn()
const mockLogoutUser = jest.fn()

jest.mock('../../src/services/userService', () => ({
  createUser: mockCreateUser,
  loginUser: mockLoginUser,
  getProfile: mockGetProfile,
  getAllUsers: mockGetAllUsers,
  getUserProfile: mockGetUserProfile,
  logoutUser: mockLogoutUser
}))

const mockAuth = jest.fn((req, res, next) => {
  req.user = { _id: 'user-id', name: 'User Name', email: 'user@example.com' }
  req.token = 'token'
  next()
})
jest.mock('../../src/middlewares/auth', () => mockAuth)
jest.mock('../../src/utils/logger', () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }))

const request = require('supertest')
const userRouter = require('../../src/routers/api/user')

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use('/api', userRouter)

describe('user router', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('POST /api/users returns token and sets cookie when signup succeeds', async () => {
    mockCreateUser.mockResolvedValue({ user: { _id: 'user-id', name: 'User Name', email: 'user@example.com' }, token: 'token' })

    const response = await request(app)
      .post('/api/users')
      .send({ name: 'User Name', email: 'user@example.com', password: 'Password123!' })

    expect(response.headers['set-cookie']).toBeDefined()
    expect(response.status).toBe(201)
    expect(response.body.token).toBe('token')
    expect(response.body.user).toMatchObject({ name: 'User Name', email: 'user@example.com' })
  })

  test('POST /api/users returns validation error on failure', async () => {
    mockCreateUser.mockRejectedValue(new Error('Failure'))

    const response = await request(app)
      .post('/api/users')
      .send({ name: 'User Name', email: 'user@example.com', password: 'Password123!' })

    expect(response.body).toEqual({ error: 'Failure' })
    expect(response.status).toBe(400)
  })

  test('POST /api/auth/login returns token and sets cookie when login succeeds', async () => {
    mockLoginUser.mockResolvedValue({ user: { _id: 'user-id', name: 'User Name', email: 'user@example.com' }, token: 'token' })

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'Password123!' })

    expect(response.headers['set-cookie']).toBeDefined()
    expect(response.status).toBe(200)
    expect(response.body.token).toBe('token')
    expect(response.body.user).toMatchObject({ email: 'user@example.com' })
  })

  test('GET /api/users/me returns profile data for authenticated users', async () => {
    mockGetProfile.mockResolvedValue({ publishedBlogs: [{ title: 'Published', text: 'Body', _id: 'blog-id' }], draftBlogs: [] })

    const response = await request(app).get('/api/users/me')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ name: 'User Name', email: 'user@example.com' })
    expect(response.body.publishedBlogs).toHaveLength(1)
  })

  test('GET /api/users returns a user list', async () => {
    mockGetAllUsers.mockResolvedValue([{ _id: 'user-id', name: 'User Name', email: 'user@example.com' }])

    const response = await request(app).get('/api/users')

    expect(response.status).toBe(200)
    expect(response.body.users).toEqual([{ _id: 'user-id', name: 'User Name', email: 'user@example.com' }])
  })

  test('GET /api/users/:id returns another user profile', async () => {
    mockGetUserProfile.mockResolvedValue({ name: 'Other User', email: 'other@example.com', publishedBlogs: [], draftBlogs: [], isEditable: false })

    const response = await request(app).get('/api/users/user-id')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ name: 'Other User', email: 'other@example.com' })
  })

  test('GET /api/users/:id returns 404 when profile is missing', async () => {
    mockGetUserProfile.mockRejectedValue(new Error('User not found'))

    const response = await request(app).get('/api/users/user-id')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'User not found' })
  })

  test('POST /api/auth/logout returns success and clears cookie', async () => {
    mockLogoutUser.mockResolvedValue()

    const response = await request(app).post('/api/auth/logout')

    expect(response.body).toEqual({ success: true })
    expect(response.status).toBe(200)
  })
})