const mongoose = require('mongoose')
const { postSchema } = require('../lib/mongo')
const CommentModel = require('./comments')
const marked = require('marked')

// 后置钩子, 用于转化 markdown 内容
postSchema.post('find', function (posts) {
  return posts.map(post => {
    post.rawContent = post.content
    post.content = marked(post.content)
    return post
  })
})

postSchema.post('findOne', function (post) {
  if (post) {
    post.rawContent = post.content
    post.content = marked(post.content)
  }
  return post
})

// 后置钩子, 用于获得一篇文章的留言数
postSchema.post('find', function (posts) {
  return Promise.all(posts.map(post => {
    return CommentModel.getCommentsCount(post._id)
      .then(cnt => {
        post.commentsCnt = cnt
        return post
      })
  }))
})

postSchema.post('findOne', function (post) {
  if (post) {
    return CommentModel
      .getCommentsCount(post._id)
      .then(cnt => {
        post.commentsCnt = cnt
        return post
      })
  }

  return post
})

const Post = mongoose.model('Post', postSchema)

module.exports = {
  // C
  create (post) {
    // 返回 Promise
    return Post.create(post)
  },
  // R
  getPostById (postId) {
    return Post
      .findOne({ _id: postId })
      .populate('author')
      .exec()
  },
  getPosts (author) {
    const filter = {}
    if (author) filter.author = author
    return Post
      .find(filter)
      .populate('author')
      .sort({ _id: -1 })
      .exec()
  },
  // U
  updatePostById (postId, data) {
    return Post.updateOne({ _id: postId }, { $set: data }).exec()
  },
  incPv (postId) {
    return Post
      .updateOne({ _id: postId }, { $inc: { pv: 1 } })
      .exec()
  },
  // D
  deletePostById (postId) {
    return Post.deleteOne({ _id: postId })
      .exec()
      .then(result => {
        if (result.ok === 1 && result.n !== 0) {
          return CommentModel.delCommentsByPostId(postId)
        }
      })
  }
}
