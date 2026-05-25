const mockGenerateAuthToken = jest.fn()
const mockSave = jest.fn()

const mockUserInstance = {
  _id: 'user-id-123',
  name: 'Mock User',
  email: 'mock@example.com',
  password: 'MockPass123!',
  tokens: [],
  save: mockSave,
  generateAuthToken: mockGenerateAuthToken
}

jest.mock('../../src/models/user', () => {
  const MockUser = jest.fn((data) => ({
    ...mockUserInstance,
    ...data,
    save: mockSave,
    generateAuthToken: mockGenerateAuthToken
  }))

  MockUser.findByCredentials = jest.fn()
  MockUser.findOne = jest.fn()
  MockUser.find = jest.fn()

  return MockUser
})

jest.mock('../../src/models/blog', () => ({ find: jest.fn() }))
jest.mock('../../src/utils/logger', () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }))

const userService = require('../../src/services/userService')
const User = require('../../src/models/user')
const Blogs = require('../../src/models/blog')

beforeEach(() => {
  jest.clearAllMocks()
  mockSave.mockResolvedValue(mockUserInstance)
  mockGenerateAuthToken.mockResolvedValue('test-token')
})

test('should create a new user with hashed password and auth token', async () => {
  const payload = { name: 'New User', email: 'newuser@example.com', password: 'NewPass123!' }

  const result = await userService.createUser(payload)

  expect(User).toHaveBeenCalledWith(payload)
  expect(mockSave).toHaveBeenCalled()
  expect(mockGenerateAuthToken).toHaveBeenCalled()
  expect(result.user).toMatchObject({
    name: 'New User',
    email: 'newuser@example.com',
    password: 'NewPass123!'
  })
  expect(result.token).toBe('test-token')
})

test('should login an existing user', async () => {
  const loginUser = { ...mockUserInstance, generateAuthToken: jest.fn().mockResolvedValue('login-token') }
  User.findByCredentials.mockResolvedValue(loginUser)

  const result = await userService.loginUser('mock@example.com', 'MockPass123!')

  expect(User.findByCredentials).toHaveBeenCalledWith('mock@example.com', 'MockPass123!')
  expect(result.user).toBe(loginUser)
  expect(result.token).toBe('login-token')
})

test('should return profile with draft blogs for owner', async () => {
  const publishedBlogs = [{ title: 'Published Post' }]
  const draftBlogs = [{ title: 'Draft Post' }]

  Blogs.find
    .mockResolvedValueOnce(publishedBlogs)
    .mockResolvedValueOnce(draftBlogs)
  User.findOne.mockResolvedValue(mockUserInstance)

  const profile = await userService.getUserProfile('user-id-123', 'user-id-123')

  expect(User.findOne).toHaveBeenCalledWith({ _id: 'user-id-123' })
  expect(Blogs.find).toHaveBeenCalledWith({ owner: 'user-id-123', published: true })
  expect(profile.name).toBe(mockUserInstance.name)
  expect(profile.email).toBe(mockUserInstance.email)
  expect(profile.publishedBlogs).toBe(publishedBlogs)
  expect(profile.draftBlogs).toBe(draftBlogs)
  expect(profile.isEditable).toBe(true)
})

test('should return all users', async () => {
  const users = [{ email: 'a@example.com' }, { email: 'b@example.com' }]
  User.find.mockResolvedValue(users)

  const result = await userService.getAllUsers()

  expect(User.find).toHaveBeenCalledWith({})
  expect(result).toBe(users)
})

test('should throw when retrieving missing user profile', async () => {
  User.findOne.mockResolvedValue(null)

  await expect(userService.getUserProfile('missing-id', 'current-id')).rejects.toThrow('User not found')
})

test('should logout user and remove token', async () => {
  const user = {
    ...mockUserInstance,
    tokens: [{ token: 'active-token' }, { token: 'remove-me' }],
    save: jest.fn().mockResolvedValue(true)
  }

  await userService.logoutUser(user, 'remove-me')

  expect(user.tokens).toEqual([{ token: 'active-token' }])
  expect(user.save).toHaveBeenCalled()
})
