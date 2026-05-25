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
const userRouter = require('../../src/routers/user')

const app = express()
const viewsPath = path.join(__dirname, '../../templates/views')
const partialsPath = path.join(__dirname, '../../templates/partials')

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(userRouter)

describe('user router', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('POST /user redirects when signup succeeds', async () => {
    mockCreateUser.mockResolvedValue({ token: 'token' })

    const response = await request(app)
      .post('/user')
      .send({ name: 'User Name', email: 'user@example.com', password: 'Password123!' })

    expect(response.headers.location).toBe('/')
    expect(response.headers['set-cookie']).toBeDefined()
    expect([200, 201, 302]).toContain(response.status)
  })

  test('POST /user renders signup page on failure', async () => {
    mockCreateUser.mockRejectedValue(new Error('Failure'))

    const response = await request(app)
      .post('/user')
      .send({ name: 'User Name', email: 'user@example.com', password: 'Password123!' })

    expect(response.text).toContain('Some thing gone wrong, try again')
    expect(response.status).toBe(200)
  })

  test('POST /user/login redirects when login succeeds', async () => {
    mockLoginUser.mockResolvedValue({ token: 'token' })

    const response = await request(app)
      .post('/user/login')
      .send({ email: 'user@example.com', password: 'Password123!' })

    expect(response.headers.location).toBe('/')
    expect(response.headers['set-cookie']).toBeDefined()
    expect([200, 302]).toContain(response.status)
  })

  test('GET /user/me returns profile page for authenticated users', async () => {
    mockGetProfile.mockResolvedValue({ publishedBlogs: [{ title: 'Published', text: 'Body', _id: 'blog-id' }], draftBlogs: [] })

    const response = await request(app).get('/user/me')

    expect(response.status).toBe(200)
    expect(response.text).toContain('User Name')
    expect(response.text).toContain('user@example.com')
  })

  test('GET /users returns a user list', async () => {
    mockGetAllUsers.mockResolvedValue([{ _id: 'user-id', name: 'User Name', email: 'user@example.com' }])

    const response = await request(app).get('/users')

    expect(response.status).toBe(200)
    expect(response.text).toContain('User Name')
    expect(response.text).toContain('user@example.com')
  })

  test('GET /users/:id returns another user profile', async () => {
    mockGetUserProfile.mockResolvedValue({ name: 'Other User', email: 'other@example.com', publishedBlogs: [], draftBlogs: [], isEditable: false })

    const response = await request(app).get('/users/user-id')

    expect(response.status).toBe(200)
    expect(response.text).toContain('Other User')
    expect(response.text).toContain('other@example.com')
  })

  test('GET /users/:id returns 404 when profile is missing', async () => {
    mockGetUserProfile.mockRejectedValue(new Error('User not found'))

    const response = await request(app).get('/users/user-id')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'User not found' })
  })

  test('GET /user/logout redirects after logout', async () => {
    mockLogoutUser.mockResolvedValue()

    const response = await request(app).get('/user/logout')

    expect(response.headers.location).toBe('/')
    expect([200, 302]).toContain(response.status)
  })
})