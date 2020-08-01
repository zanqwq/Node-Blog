const express = require('express')
const router = express.Router()
const ObjectId = require('mongoose').Types.ObjectId

const checkLogin = require('../middlewares/check').checkLogin
const CommentModel = require('../models/comments')

// C
router.post('/', checkLogin, (req, res, next) => {
  const author = req.session.user._id
  const postId = new ObjectId(req.fields.postId)
  const content = req.fields.content

  try {
    if (!content.length) {
      throw new Error('请填写留言内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  const comment = {
    author,
    postId,
    content
  }

  CommentModel.create(comment)
    .then(() => {
      req.flash('success', '留言成功')
      res.redirect('back')
    })
    .catch(next)
})

// D
router.get('/:commentId/remove', checkLogin, (req, res, next) => {
  const commentId = new ObjectId(req.params.commentId)
  const author = req.session.user._id

  CommentModel.getCommentById(commentId)
    .then(comment => {
      if (!comment) {
        throw new Error('留言不存在')
      }
      if (comment.author._id.toString() !== author.toString()) {
        throw new Error('权限不足')
      }
      CommentModel.delCommentById(commentId)
        .then(() => {
          req.flash('success', '留言删除成功')
          res.redirect('back')
        })
        .catch(next)
    })
    .catch(next)
})

module.exports = {
  path: '/comments',
  router
}
