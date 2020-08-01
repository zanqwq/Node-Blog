const config = require('config-lite')(__dirname)
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.connection.on('error', function (err) {
  console.log(err)
})

try {
  mongoose.connect(config.mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false
  })
} catch (e) {
  console.log(e.message)
}

const moment = require('moment')
const obj2Ts = require('objectid-to-timestamp')

// 全局后置钩子
mongoose.plugin(function (schema, options) {
  schema.post('find', function (docs) {
    docs.forEach(doc => {
      doc.createdAt = moment(obj2Ts(doc._id)).format('YYYY-MM-DD')
    })
  })

  schema.post('findOne', function (doc) {
    if (doc) doc.createdAt = moment(obj2Ts(doc._id)).format('YYYY-MM-DD')
  })
})

// #region user
const userSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, required: true },
  gender: { type: String, enum: ['m', 'f', 'x'], default: 'x' },
  bio: { type: String, required: true }
})
userSchema.index({ name: 1 }, { unique: true })
// #endregion

// #region post
const postSchema = new Schema({
  author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  pv: { type: Number, default: 0 }
})
postSchema.index({ author: 1, _id: -1 })
// #endregion

// #region comment
const commentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  content: { type: String, required: true },
  postId: { type: Schema.Types.ObjectId, required: true, ref: 'Post' }
})
commentSchema.index({ postId: 1, _id: 1 })
// #endregion

module.exports = {
  userSchema,
  postSchema,
  commentSchema
}
