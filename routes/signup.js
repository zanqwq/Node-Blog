const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

router.get('/', checkNotLogin, (req, res, next) => {
  res.render('signup')
})

router.post('/', checkNotLogin, (req, res, next) => {
  const name = req.fields.name
  const gender = req.fields.gender
  const avatar = req.files.avatar.path.split(path.sep).pop()
  const bio = req.fields.bio
  let password = req.fields.password
  const repassword = req.fields.repassword

  // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('请将用户名限制在 1-10 个字符')
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1) {
      throw new Error('性别只能是 m, f 或 x')
    }
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('请将个人简介限制在 1-30 个字符')
    }
    if (!req.files.avatar.name) {
      throw new Error('请上传头像')
    }
    if (password.length < 6) {
      throw new Error('密码至少 6 个字符')
    }
    if (password !== repassword) {
      throw new Error('两次输入密码不一致')
    }
  } catch (e) {
    fs.unlink(req.files.avatar.path, () => {
      console.log('删除成功')
    })
    req.flash('error', e.message)
    return res.redirect('/signup')
  }

  // 明文密码加密
  password = sha1(password)

  const user = {
    name,
    password,
    gender,
    avatar,
    bio
  }

  UserModel.create(user)
    .then(_user => {
      _user.password = null
      delete _user.password
      req.session.user = _user
      req.flash('sucess', '注册成功')
      res.redirect('posts')
    })
    .catch(reason => {
      // 异步删除上传的头像
      fs.unlink(req.files.avatar.path, () => {
        console.log('删除成功')
      })
      if (reason.message.match('duplicate key')) {
        req.flash('error', '用户名已被占用')
        return res.redirect('/signup')
      }
      next(reason)
    })
})

module.exports = {
  path: '/signup',
  router
}
