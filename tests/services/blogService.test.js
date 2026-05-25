const mockSave = jest.fn()

const mockBlogs = jest.fn((data) => ({
  ...data,
  save: mockSave
}))
mockBlogs.find = jest.fn()
mockBlogs.findOne = jest.fn()
mockBlogs.findOneAndDelete = jest.fn()

const mockComments = {
  find: jest.fn(),
  deleteMany: jest.fn()
}

jest.mock('../../src/models/blog', () => mockBlogs)
jest.mock('../../src/models/comments', () => mockComments)
jest.mock('../../src/utils/logger', () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }))

const blogService = require('../../src/services/blogService')

describe('blogService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSave.mockResolvedValue({ _id: 'blog-id', title: 'Test', text: 'Text', published: false })
  })

  test('getPublishedBlogs returns published blogs', async () => {
    mockBlogs.find.mockResolvedValue([{ title: 'Published' }])

    const blogs = await blogService.getPublishedBlogs()

    expect(blogs).toEqual([{ title: 'Published' }])
    expect(mockBlogs.find).toHaveBeenCalledWith({ published: true })
  })

  test('getBlogWithComments returns blog with linked comments', async () => {
    const blog = { _id: 'blog-id', title: 'Hello' }
    mockBlogs.findOne.mockResolvedValue(blog)
    mockComments.find.mockResolvedValue([{ text: 'Nice post' }])

    const result = await blogService.getBlogWithComments('blog-id')

    expect(result.blog).toBe(blog)
    expect(result.comments).toEqual([{ text: 'Nice post' }])
  })

  test('getBlogWithComments throws when blog is not found', async () => {
    mockBlogs.findOne.mockResolvedValue(null)

    await expect(blogService.getBlogWithComments('missing-id')).rejects.toThrow('Blog not found')
  })

  test('createBlog saves and returns a valid blog', async () => {
    const blogData = { title: 'Hello', text: 'Body', published: true, owner: 'owner-id', author: 'Author' }

    const result = await blogService.createBlog(blogData)

    expect(mockSave).toHaveBeenCalled()
    expect(result).toEqual(expect.objectContaining({ title: 'Test', text: 'Text' }))
  })

  test('createBlog throws when title is missing', async () => {
    await expect(blogService.createBlog({ text: 'Body', published: false, owner: 'owner-id', author: 'Author' })).rejects.toThrow('Title is required')
  })

  test('createBlog throws when text is missing', async () => {
    await expect(blogService.createBlog({ title: 'Hello', published: false, owner: 'owner-id', author: 'Author' })).rejects.toThrow('Text is required')
  })

  test('updateBlog throws when blog is not found', async () => {
    mockBlogs.findOne.mockResolvedValue(null)

    await expect(blogService.updateBlog('missing-id', { title: 'X', text: 'Y', published: true })).rejects.toThrow('Blog not found')
  })

  test('updateBlog updates and saves a blog', async () => {
    const blog = { _id: 'blog-id', title: 'Old', text: 'Old', published: false, save: jest.fn().mockResolvedValue({ _id: 'blog-id', title: 'New', text: 'New', published: true }) }
    mockBlogs.findOne.mockResolvedValue(blog)

    const updatedBlog = await blogService.updateBlog('blog-id', { title: 'New', text: 'New', published: true })

    expect(blog.save).toHaveBeenCalled()
    expect(updatedBlog).toEqual({ _id: 'blog-id', title: 'New', text: 'New', published: true })
  })

  test('deleteBlog removes post and comments when found', async () => {
    const blog = { _id: 'blog-id' }
    mockBlogs.findOneAndDelete.mockResolvedValue(blog)
    mockComments.deleteMany.mockResolvedValue({})

    const result = await blogService.deleteBlog('blog-id', 'owner-id')

    expect(mockComments.deleteMany).toHaveBeenCalledWith({ postID: blog._id })
    expect(result).toBe(blog)
  })

  test('deleteBlog returns null when blog is not found', async () => {
    mockBlogs.findOneAndDelete.mockResolvedValue(null)

    const result = await blogService.deleteBlog('missing-id', 'owner-id')

    expect(result).toBeNull()
  })
})