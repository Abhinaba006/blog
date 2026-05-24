const Comments = require('../models/comments')

const getCommentsForBlog = async (blogId) => {
  return Comments.find({ postID: blogId })
}

const createComment = async (commentData) => {
  const comment = new Comments({
    ...commentData
  })
  return comment.save()
}

module.exports = {
  getCommentsForBlog,
  createComment
}
