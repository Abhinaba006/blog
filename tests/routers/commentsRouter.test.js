const express = require('express')
const request = require('supertest')
const commentsRouter = require('../../src/routers/api/comments')

jest.mock('../../src/middlewares/auth', () => jest.fn((req, res, next) => {
  req.user = { _id: 'user-id', name: 'Test User' }
  next()
}))

jest.mock('../../src/services/commentService', () => ({
  createComment: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn()
}))

jest.mock('../../src/utils/logger', () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }))

const commentService = require('../../src/services/commentService')

const app = express()
app.use(express.json())
app.use('/api', commentsRouter)

describe('api comments router', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('POST /api/blogs/:id/comments creates a comment', async () => {
    commentService.createComment.mockResolvedValue({ _id: 'comment-id', text: 'Nice' })

    const response = await request(app)
      .post('/api/blogs/blog-id/comments')
      .send({ text: 'Nice' })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ success: true })
    expect(commentService.createComment).toHaveBeenCalledWith({
      text: 'Nice',
      postID: 'blog-id',
      owner: 'user-id',
      author: 'Test User'
    })
  })

  test('PUT /api/comments/:id updates a comment', async () => {
    commentService.updateComment.mockResolvedValue({ _id: 'comment-id', text: 'Updated' })

    const response = await request(app)
      .put('/api/comments/comment-id')
      .send({ text: 'Updated' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ success: true })
    expect(commentService.updateComment).toHaveBeenCalledWith('comment-id', 'user-id', 'Updated')
  })

  test('DELETE /api/comments/:id deletes a comment', async () => {
    commentService.deleteComment.mockResolvedValue({ _id: 'comment-id' })

    const response = await request(app).delete('/api/comments/comment-id')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ success: true })
    expect(commentService.deleteComment).toHaveBeenCalledWith('comment-id', 'user-id')
  })

  test('PUT /api/comments/:id returns 400 when update fails', async () => {
    commentService.updateComment.mockRejectedValue(new Error('Not allowed'))

    const response = await request(app)
      .put('/api/comments/comment-id')
      .send({ text: 'Updated' })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Not allowed' })
  })
})
