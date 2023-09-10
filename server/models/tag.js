// Tag Document Schema
const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  users: {
    type: [String],
    default: []
  }
})

module.exports = mongoose.model('Tag', tagSchema)
