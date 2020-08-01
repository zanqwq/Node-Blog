const mongoose = require('mongoose')
const { commentSchema } = require('../lib/mongo')
const marked = require('marked')

commentSchema.post('find', function (comments) {
  return comments.map(comment => {
    comment.content = marked(comment.content)
    return comment
  })
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = {
  // C
  create (comment) {
    return Comment.create(comment)
  },
  // R
  getCommentById (commentId) {
    return Comment.findById(commentId).exec()
  },
  getComments (postId) {
    return Comment.find({ postId })
      .populate('author')
      .sort({ _id: 1 })
      .exec()
  },
  getCommentsCount (postId) {
    return Comment.find({ postId }).countDocuments().exec()
  },
  // D
  delCommentById (commentId) {
    return Comment.deleteOne({ _id: commentId }).exec()
  },
  delCommentsByPostId (postId) {
    return Comment.deleteMany({ postId }).exec()
  }
}
