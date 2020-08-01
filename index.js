const express = require('express')
const app = express()
const path = require('path')
// express 的 session 中间件
// 为 req 添加了 session 属性
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
// flash 中间件使用 session 存储信息
const flash = require('connect-flash')
// express-fromidable 是用于解析表单数据的中间件, 包括 multipart/form-data 文件上传
// 普通数据存在 req.fields, 文件存在 req.files
const expressFormidable = require('express-formidable')
const config = require('config-lite')(__dirname)
const pkg = require('./package.json')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  // session 名
  name: config.session.key,
  // session 密钥
  secret: config.session.secret,
  // 强制更新 session
  resave: true,
  // 强制创建 session, 即使用户未登录
  saveUninitialized: false,
  cookie: {
    maxAge: config.session.maxAge
  },
  // 将 session 存到 mongodb 中
  store: new MongoStore({
    url: config.mongodb
  })
}))

app.use(flash())

app.use(expressFormidable({
  // 表单提交文件上传路径
  uploadDir: path.join(__dirname, 'public/img'),
  // 保留文件后缀
  keepExtensions: true
}))

// 设置全局模板变量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}
// 添加渲染模板需要的3个变量
app.use((req, res, next) => {
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})

const setupRoutes = require('./routes')
setupRoutes(app)

if (module.parent) {
  module.eports = app
} else {
  app.listen(config.port, (req, res) => {
    console.log(`App ${pkg.name} listening on ${config.port}`)
  })
}
