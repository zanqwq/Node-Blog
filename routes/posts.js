const express = require('express')
const router = express.Router()
const ObjectId = require('mongoose').Types.ObjectId
const PostModel = require('../models/posts')
const CommentModel = require('../models/comments')
const checkLogin = require('../middlewares/check').checkLogin

// #region C
router.get('/create', (req, res, next) => {
  res.render('create')
})

router.post('/create', checkLogin, (req, res, next) => {
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content

  try {
    if (!title.length) {
      throw new Error('请填写文章标题')
    }
    if (!content.length) {
      throw new Error('请填写文章内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  const post = {
    author,
    title,
    content
  }

  PostModel.create(post)
    .then(_post => {
      req.flash('success', '发表成功')
      res.redirect(`/posts/${_post._id}`)
    })
    .catch(next)
})
// #endregion

// #region R
router.get('/', (req, res, next) => {
  let author = new ObjectId(req.query.author)
  if (!req.query.author) author = null

  PostModel.getPosts(author)
    .then(posts => {
      posts.map(post => {
        post.author.password = null
        delete post.author.password
        return post
      })
      res.render('posts', { posts })
    })
    .catch(next)
})

router.get('/:postId', (req, res, next) => {
  const postId = new ObjectId(req.params.postId)
  Promise.all([
    PostModel.getPostById(postId),
    CommentModel.getComments(postId),
    PostModel.incPv(postId)
  ])
    .then(results => {
      const post = results[0]
      post.author.password = null
      delete post.author.password
      const comments = results[1]
      comments.map(comment => {
        comment.author.password = null
        delete comment.author.password
        return comment
      })
      res.render('post', { post, comments })
    })
    .catch(next)
})
// #endregion

// #region U
router.get('/:postId/edit', checkLogin, (req, res, next) => {
  const postId = new ObjectId(req.params.postId)
  const author = req.session.user._id
  PostModel.getPostById(postId)
    .then(post => {
      if (!post) {
        throw new Error('文章不存在')
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('权限不足')
      }
      post.author.password = null
      res.render('edit', { post })
    })
    .catch(next)
})

router.post('/:postId/edit', checkLogin, (req, res, next) => {
  const postId = new ObjectId(req.params.postId)
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content

  try {
    if (!title.length) {
      throw new Error('请填写标题')
    }
    if (!content.length) {
      throw new Error('请填写内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  PostModel.getPostById(postId)
    .then(post => {
      if (!post) {
        throw new Error('文章不存在')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('没有权限')
      }

      PostModel.updatePostById(postId, { title, content })
        .then(() => {
          req.flash('success', '编辑文章成功')
          res.redirect(`/posts/${postId}`)
        })
        .catch(next)
    })
    .catch(next)
})
// #endregion

// #region D
router.get('/:postId/remove', checkLogin, (req, res, next) => {
  const postId = new ObjectId(req.params.postId)
  const author = req.session.user._id
  PostModel.getPostById(postId)
    .then(post => {
      if (!post) {
        throw new Error('文章不存在')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('没有权限')
      }
      PostModel.deletePostById(postId)
        .then(() => {
          req.flash('success', '文章删除成功')
          res.redirect('/posts')
        })
        .catch(next)
    })
    .catch(next)
})
// #endregion

module.exports = {
  path: '/posts',
  router
}
