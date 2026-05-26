const express = require('express')
const request = require('supertest')
const blogRouter = require('../../src/routers/api/blog')

jest.mock('../../src/middlewares/auth', () => jest.fn((req, res, next) => {
  req.user = { _id: 'user-id', name: 'Test User' }
  next()
}))

jest.mock('../../src/services/blogService', () => ({
  getPublishedBlogs: jest.fn(),
  getBlogWithComments: jest.fn(),
  createBlog: jest.fn(),
  updateBlog: jest.fn(),
  deleteBlog: jest.fn()
}))

jest.mock('../../src/utils/logger', () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }))

const blogService = require('../../src/services/blogService')

const app = express()
app.use(express.json())
app.use('/api', blogRouter)

describe('api blog router', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('GET /api/blogs returns published blogs', async () => {
    blogService.getPublishedBlogs.mockResolvedValue([{ title: 'Published Post' }])

    const response = await request(app).get('/api/blogs')

    expect(response.status).toBe(200)
    expect(response.body.blogs).toEqual([{ title: 'Published Post' }])
    expect(blogService.getPublishedBlogs).toHaveBeenCalled()
  })

  test('GET /api/blogs/:id returns blog with comments', async () => {
    blogService.getBlogWithComments.mockResolvedValue({ blog: { _id: 'blog-id', title: 'Hello' }, comments: [{ text: 'Nice' }] })

    const response = await request(app).get('/api/blogs/blog-id')

    expect(response.status).toBe(200)
    expect(response.body.blog).toEqual({ _id: 'blog-id', title: 'Hello' })
    expect(response.body.comments).toEqual([{ text: 'Nice' }])
    expect(blogService.getBlogWithComments).toHaveBeenCalledWith('blog-id')
  })

  test('GET /api/blogs/:id returns 404 when blog is missing', async () => {
    blogService.getBlogWithComments.mockRejectedValue(new Error('Blog not found'))

    const response = await request(app).get('/api/blogs/missing-id')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Blog not found' })
  })

  test('POST /api/blogs creates a blog and returns it', async () => {
    const createdBlog = { _id: 'blog-id', title: 'New', text: 'Text', published: true }
    blogService.createBlog.mockResolvedValue(createdBlog)

    const response = await request(app)
      .post('/api/blogs')
      .send({ title: 'New', text: 'Text', published: true })

    expect(response.status).toBe(201)
    expect(response.body.blog).toEqual(createdBlog)
    expect(blogService.createBlog).toHaveBeenCalledWith({
      title: 'New',
      text: 'Text',
      published: true,
      owner: 'user-id',
      author: 'Test User'
    })
  })

  test('PUT /api/blogs/:id updates a blog', async () => {
    const updatedBlog = { _id: 'blog-id', title: 'Updated', text: 'Text', published: true }
    blogService.updateBlog.mockResolvedValue(updatedBlog)

    const response = await request(app)
      .put('/api/blogs/blog-id')
      .send({ title: 'Updated', text: 'Text', published: true })

    expect(response.status).toBe(200)
    expect(response.body.blog).toEqual(updatedBlog)
    expect(blogService.updateBlog).toHaveBeenCalledWith('blog-id', {
      title: 'Updated',
      text: 'Text',
      published: true
    })
  })

  test('DELETE /api/blogs/:id returns success when deleted', async () => {
    blogService.deleteBlog.mockResolvedValue({ _id: 'blog-id' })

    const response = await request(app).delete('/api/blogs/blog-id')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ success: true })
    expect(blogService.deleteBlog).toHaveBeenCalledWith('blog-id', 'user-id')
  })
})
