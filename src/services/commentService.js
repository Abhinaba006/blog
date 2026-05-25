const Comments = require('../models/comments')
const logger = require('../utils/logger')

const getCommentsForBlog = async (blogId) => {
  try {
    logger.debug('comment-service', 'Fetching comments for blog', { blogId })
    const comments = await Comments.find({ postID: blogId })
    logger.info('comment-service', 'Comments fetched', { blogId, count: comments.length })
    return comments
  } catch (error) {
    logger.error('comment-service', 'Error fetching comments', { blogId, error: error.message })
    throw error
  }
}

const createComment = async (commentData) => {
  try {
    logger.debug('comment-service', 'Creating comment', { postID: commentData.postID, author: commentData.author })
    const comment = new Comments({
      ...commentData
    })
    const newComment = await comment.save()
    logger.info('comment-service', 'Comment created successfully', { commentId: newComment._id, postID: commentData.postID })
    return newComment
  } catch (error) {
    logger.error('comment-service', 'Error creating comment', { postID: commentData.postID, error: error.message })
    throw error
  }
}

const updateComment = async (commentId, userId, text) => {
  try {
    logger.debug('comment-service', 'Updating comment', { commentId, userId })
    const comment = await Comments.findOne({ _id: commentId, owner: userId })
    if (!comment) {
      throw new Error('Comment not found or permission denied.')
    }
    comment.text = text
    const updatedComment = await comment.save()
    logger.info('comment-service', 'Comment updated successfully', { commentId, userId })
    return updatedComment
  } catch (error) {
    logger.error('comment-service', 'Error updating comment', { commentId, userId, error: error.message })
    throw error
  }
}

const deleteComment = async (commentId, userId) => {
  try {
    logger.debug('comment-service', 'Deleting comment', { commentId, userId })
    const comment = await Comments.findOne({ _id: commentId, owner: userId })
    if (!comment) {
      throw new Error('Comment not found or permission denied.')
    }
    await comment.remove()
    logger.info('comment-service', 'Comment deleted successfully', { commentId, userId })
    return comment
  } catch (error) {
    logger.error('comment-service', 'Error deleting comment', { commentId, userId, error: error.message })
    throw error
  }
}

module.exports = {
  getCommentsForBlog,
  createComment,
  updateComment,
  deleteComment
}
