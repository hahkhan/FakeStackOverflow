// Question Document Schema
const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 50
  },
  summary: {
    type: String,
    required: true,
    maxLength: 140
  },
  text: {
    type: String,
    default: '',
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  answers: {
    type: [String],
    default: []
  },
  asked_by: {
    type: String,
    default: 'Anonymous'
  },
  ask_date_time: {
    type: Date,
    default: new Date()
  },
  views: {
    type: Number,
    default: 0
  },
  votes: {
    type: Number,
    default: 0
  },
  comments: {
    type: [String],
    default: []
  }
})

module.exports = mongoose.model('Question', questionSchema)
