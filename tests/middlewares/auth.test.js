jest.mock('jsonwebtoken', () => ({ verify: jest.fn() }))
jest.mock('../../src/models/user', () => ({ findOne: jest.fn() }))
jest.mock('../../src/utils/logger', () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }))

const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const auth = require('../../src/middlewares/auth')

describe('auth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls next when token is valid and user exists', async () => {
    const req = { cookies: { token: 'valid-token' } }
    const res = { render: jest.fn() }
    const next = jest.fn()

    jwt.verify.mockReturnValue({ _id: 'user-id' })
    User.findOne.mockResolvedValue({ _id: 'user-id', email: 'test@example.com', tokens: [{ token: 'valid-token' }] })

    await auth(req, res, next)

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.SECRET_KEY)
    expect(User.findOne).toHaveBeenCalledWith({ _id: 'user-id', 'tokens.token': 'valid-token' })
    expect(req.user).toEqual(expect.objectContaining({ email: 'test@example.com' }))
    expect(req.token).toBe('valid-token')
    expect(next).toHaveBeenCalled()
    expect(res.render).not.toHaveBeenCalled()
  })

  test('renders login when token verification fails', async () => {
    const req = { cookies: { token: 'bad-token' } }
    const res = { render: jest.fn() }
    const next = jest.fn()

    jwt.verify.mockImplementation(() => { throw new Error('invalid token') })

    await auth(req, res, next)

    expect(res.render).toHaveBeenCalledWith('login', { msg: 'please login or sign up ' })
    expect(next).not.toHaveBeenCalled()
  })

  test('renders login when no user is found for token', async () => {
    const req = { cookies: { token: 'valid-token' } }
    const res = { render: jest.fn() }
    const next = jest.fn()

    jwt.verify.mockReturnValue({ _id: 'missing-user' })
    User.findOne.mockResolvedValue(null)

    await auth(req, res, next)

    expect(res.render).toHaveBeenCalledWith('login', { msg: 'please login or sign up ' })
    expect(next).not.toHaveBeenCalled()
  })
})