const bcrypt = require('bcryptjs')
const User = require('../../src/models/user')

describe('User model', () => {
  beforeAll(() => {
    process.env.SECRET_KEY = 'test-secret'
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('toJSON removes password, tokens, and __v', () => {
    const user = new User({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret'
    })

    user.tokens = [{ token: 'hidden-token' }]
    user.__v = 0

    const json = user.toJSON()

    expect(json.password).toBeUndefined()
    expect(json.tokens).toBeUndefined()
    expect(json.__v).toBeUndefined()
    expect(json.email).toBe('jane@example.com')
  })

  test('generateAuthToken saves a token and returns it', async () => {
    const user = new User({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret'
    })

    user.save = jest.fn().mockResolvedValue(user)
    const token = await user.generateAuthToken()

    expect(token).toBeDefined()
    expect(user.tokens).toHaveLength(1)
    expect(user.tokens[0].token).toBe(token)
    expect(user.save).toHaveBeenCalled()
  })

  test('findByCredentials throws when user is not found', async () => {
    User.findOne = jest.fn().mockResolvedValue(null)

    await expect(User.findByCredentials('missing@example.com', 'password')).rejects.toThrow('No user found')
    expect(User.findOne).toHaveBeenCalledWith({ email: 'missing@example.com' })
  })

  test('findByCredentials throws when password does not match', async () => {
    const hashedPassword = await bcrypt.hash('correct-password', 10)
    User.findOne = jest.fn().mockResolvedValue({ email: 'jane@example.com', password: hashedPassword })

    await expect(User.findByCredentials('jane@example.com', 'wrong-password')).rejects.toThrow()
  })

  test('findByCredentials returns user when credentials are valid', async () => {
    const hashedPassword = await bcrypt.hash('correct-password', 10)
    const expectedUser = { email: 'jane@example.com', password: hashedPassword }
    User.findOne = jest.fn().mockResolvedValue(expectedUser)

    const user = await User.findByCredentials('jane@example.com', 'correct-password')

    expect(user).toBe(expectedUser)
  })
})