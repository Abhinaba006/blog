const mockSave = jest.fn()
const mockRemove = jest.fn().mockResolvedValue(true)

const mockComments = jest.fn((data) => ({
  ...data,
  save: mockSave,
  remove: mockRemove
}))
mockComments.find = jest.fn()
mockComments.findOne = jest.fn()

jest.mock('../../src/models/comments', () => mockComments)
jest.mock('../../src/utils/logger', () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }))

const commentService = require('../../src/services/commentService')

describe('commentService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSave.mockResolvedValue({ _id: 'comment-id', text: 'Nice', postID: 'blog-id' })
  })

  test('getCommentsForBlog returns comments for a blog', async () => {
    mockComments.find.mockResolvedValue([{ text: 'Nice' }])

    const result = await commentService.getCommentsForBlog('blog-id')

    expect(result).toEqual([{ text: 'Nice' }])
    expect(mockComments.find).toHaveBeenCalledWith({ postID: 'blog-id' })
  })

  test('createComment saves and returns a comment', async () => {
    const result = await commentService.createComment({ postID: 'blog-id', author: 'author', text: 'Nice' })

    expect(mockSave).toHaveBeenCalled()
    expect(result).toEqual({ _id: 'comment-id', text: 'Nice', postID: 'blog-id' })
  })

  test('updateComment saves updated comment if found', async () => {
    const comment = { _id: 'comment-id', owner: 'user-id', text: 'Old', save: jest.fn().mockResolvedValue({ _id: 'comment-id', text: 'New' }) }
    mockComments.findOne.mockResolvedValue(comment)

    const result = await commentService.updateComment('comment-id', 'user-id', 'New')

    expect(comment.save).toHaveBeenCalled()
    expect(result).toEqual({ _id: 'comment-id', text: 'New' })
  })

  test('updateComment throws when not found', async () => {
    mockComments.findOne.mockResolvedValue(null)

    await expect(commentService.updateComment('comment-id', 'user-id', 'New')).rejects.toThrow('Comment not found or permission denied.')
  })

  test('deleteComment removes comment when found', async () => {
    const comment = { _id: 'comment-id', owner: 'user-id', remove: jest.fn().mockResolvedValue(true) }
    mockComments.findOne.mockResolvedValue(comment)

    const result = await commentService.deleteComment('comment-id', 'user-id')

    expect(comment.remove).toHaveBeenCalled()
    expect(result).toBe(comment)
  })

  test('deleteComment throws when comment is not found', async () => {
    mockComments.findOne.mockResolvedValue(null)

    await expect(commentService.deleteComment('comment-id', 'user-id')).rejects.toThrow('Comment not found or permission denied.')
  })
})