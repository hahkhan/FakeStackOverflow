// Comment Document Schema
const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  by: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  com_date_time: {
    type: Date,
    default: new Date()
  },
  votes: {
    type: Number,
    default: 0
  }
})

module.exports = mongoose.model('Comment', commentSchema)
