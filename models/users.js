const mongoose = require('mongoose')
const userSchema = require('../lib/mongo').userSchema
const User = mongoose.model('User', userSchema)

module.exports = {
  create (user) {
    return User.create(user)
  },
  getUserByName (name) {
    // findOne 返回一个 Query
    // exec 这个 query 返回 Promise
    return User.findOne({ name })
      .exec()
  }
}
