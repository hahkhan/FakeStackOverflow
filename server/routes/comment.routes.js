const express = require('express')
const router = express.Router()
const CommentModel = require('./../models/comment.js')
const QuestionModel = require('./../models/question.js')
const AnswerModel = require('./../models/answer.js')

router.route('/lookup/all').get(async (req, res) => {
  const comments = await CommentModel.find()
  res.json({ status: 'SUCCESS', comments, msg: 'Comments retrieved successfully' })
})

router.route('/lookup/id/:id').get(async (req, res) => {
  const tag = await CommentModel.findById(req.params.id)
  if (tag == null) {
    res.json({ status: 'ERROR', msg: 'No comment found with the provided id' })
  } else {
    res.json({ status: 'SUCCESS', tag, msg: 'Comment found successfully' })
  }
})

router.route('/lookup/question/:id').get(async (req, res) => {
  const question = await QuestionModel.findById(req.params.id)
  if (question != null) {
    const comments = []
    for (const i in question.comments) {
      const id = question.comments[i]
      const comment = await CommentModel.findById(id)
      comments.push(comment)
    }
    comments.sort((a, b) => {
      return new Date(b.com_date_time) - new Date(a.com_date_time)
    })
    res.json({ status: 'SUCCESS', comments, msg: 'Comments retrieved successfully' })
  } else {
    res.json({ status: 'ERROR', msg: 'No question was found with the provided id' })
  }
})

router.route('/lookup/answer/:id').get(async (req, res) => {
  const answer = await AnswerModel.findById(req.params.id)
  if (answer != null) {
    const comments = []
    for (const i in answer.comments) {
      const id = answer.comments[i]
      const comment = await CommentModel.findById(id)
      comments.push(comment)
    }
    comments.sort((a, b) => {
      return new Date(b.com_date_time) - new Date(a.com_date_time)
    })
    res.json({ status: 'SUCCESS', comments, msg: 'Comments retrieved successfully' })
  } else {
    res.json({ status: 'ERROR', msg: 'No answer was found with the provided id' })
  }
})

router.route('/increase/vote/').post(async (req, res) => {
  const comment = await CommentModel.findById(req.body.id)
  if (comment != null) {
    comment.votes += 1
    await comment.save()
    res.json({ status: 'SUCCESS', msg: 'Comment vote count increased successfully' })
  } else {
    res.json({ status: 'ERROR', msg: 'Unable to increase comment vote' })
  }
})

module.exports = router
