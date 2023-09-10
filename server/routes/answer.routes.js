const express = require('express')
const router = express.Router()
const QuestionModel = require('./../models/question.js')
const UserModel = require('./../models/user.js')
const AnswerModel = require('./../models/answer.js')
const CommentModel = require('./../models/comment.js')

router.route('/lookup/all').get(async (req, res) => {
  const answers = await AnswerModel.find()
  res.json({ status: 'SUCCESS', answers, msg: 'Answers retrieved successfully' })
})

router.route('/lookup/id/:id').get(async (req, res) => {
  const answer = await AnswerModel.findById(req.params.id)
  if (answer != null) {
    res.json({ status: 'SUCCESS', answer, msg: 'Answer retrieved successfully' })
  } else {
    res.json({ status: 'ERROR', msg: 'No answer was found with the provided id' })
  }
})

router.route('/lookup/question/:id').get(async (req, res) => {
  const question = await QuestionModel.findById(req.params.id)
  if (question != null) {
    const answers = []
    for (const i in question.answers) {
      const id = question.answers[i]
      const answer = await AnswerModel.findById(id)
      answers.push(answer)
    }
    answers.sort((a, b) => {
      return new Date(b.ans_date_time) - new Date(a.ans_date_time)
    })
    res.json({ status: 'SUCCESS', answers, msg: 'Answers retrieved successfully' })
  } else {
    res.json({ status: 'ERROR', msg: 'No question was found with the provided id' })
  }
})

router.route('/lookup/question/:id/:userEmail').get(async (req, res) => {
  const question = await QuestionModel.findById(req.params.id)
  if (question != null) {
    const myAnswers = []
    const otherAnswers = []
    for (const i in question.answers) {
      const id = question.answers[i]
      const answer = await AnswerModel.findById(id)
      if (answer.ans_by === req.params.userEmail) {
        myAnswers.push(answer)
      } else {
        otherAnswers.push(answer)
      }
    }
    myAnswers.sort((a, b) => {
      return new Date(b.ans_date_time) - new Date(a.ans_date_time)
    })
    otherAnswers.sort((a, b) => {
      return new Date(b.ans_date_time) - new Date(a.ans_date_time)
    })
    res.json({ status: 'SUCCESS', answers: myAnswers.concat(otherAnswers), msg: 'Answers retrieved successfully' })
  } else {
    res.json({ status: 'ERROR', msg: 'No question was found with the provided id' })
  }
})

router.route('/new').post(async (req, res) => {
  // eslint-disable-next-line no-useless-escape
  if (req.body.text.match(/\[[^\]]*\]\s*\((?:(?!https?:\/\/)[^\)]+)*\)/g)) {
    res.json({ status: 'ERROR', msg: 'The text contains an invalid hyperlink' })
  } else if (req.body.text.match(/\[(?![\w\s\d]+)\]\((https?:\/\/[\w\d./?=#]+)\)/g)) {
    res.json({ status: 'ERROR', msg: 'The text contains an invalid hyperlink' })
  } else if (req.body.text === '') {
    res.json({ status: 'ERROR', msg: 'The text cannot be empty' })
  } else {
    // Make Answer
    const answer = new AnswerModel({
      text: req.body.text,
      ans_by: req.body.user.email,
      ans_date_time: new Date()
    })
    // Associate answer with question
    const question = await QuestionModel.findById(req.body.qid)
    if (question != null) {
      question.answers.push(answer._id.toString())
      await question.save()
    }
    answer.save()
      .then(() => res.json({ status: 'SUCCESS', msg: 'Answer saved successfully' }))
      .catch((err) => res.json({ status: 'ERROR', msg: err }))
  }
})

router.route('/update').post(async (req, res) => {
  const answer = await AnswerModel.findById(req.body.id)
  if (answer != null) {
    // eslint-disable-next-line no-useless-escape
    if (req.body.text.match(/\[[^\]]*\]\s*\((?:(?!https?:\/\/)[^\)]+)*\)/g)) {
      res.json({ status: 'ERROR', msg: 'The text contains an invalid hyperlink' })
    } else if (req.body.text.match(/\[(?![\w\s\d]+)\]\((https?:\/\/[\w\d./?=#]+)\)/g)) {
      res.json({ status: 'ERROR', msg: 'The text contains an invalid hyperlink' })
    } else if (req.body.text === '') {
      res.json({ status: 'ERROR', msg: 'The text cannot be empty' })
    } else {
      answer.text = req.body.text
      answer.save()
        .then(() => res.json({ status: 'SUCCESS', msg: 'Answer updated successfully' }))
        .catch((err) => res.json({ status: 'ERROR', msg: err }))
    }
  } else {
    res.json({ status: 'ERROR', msg: 'Unable to find an answer with the provided id' })
  }
})

router.route('/comment').post(async (req, res) => {
  const answer = await AnswerModel.findById(req.body.id)
  if (answer == null) {
    res.json({ status: 'ERROR', msg: 'No answer was found with the provided id' })
  } else if (req.body.text === '') {
    res.json({ status: 'ERROR', msg: 'The comment text cannot be empty' })
  } else if (req.body.text.length > 140) {
    res.json({ status: 'ERROR', msg: 'The comment text must have a maximum of 140 characters' })
  } else {
    let text = req.body.text
    if (req.body.user.reputation < 50) {
      text += '<br>**This user has a reputation less than 50 points**'
    }
    // Make Comment
    const comment = new CommentModel({
      by: req.body.user.email,
      text,
      com_date_time: new Date()
    })
    // Associate comment with answer
    answer.comments.push(comment._id.toString())
    await answer.save()
    comment.save()
      .then(() => res.json({ status: 'SUCCESS', msg: 'Comment saved successfully' }))
      .catch((err) => res.json({ status: 'ERROR', msg: err }))
  }
})

router.route('/increase/vote/').post(async (req, res) => {
  const answer = await AnswerModel.findById(req.body.id)
  const user = await UserModel.findOne({ email: answer.ans_by })
  if (user != null) {
    user.reputation += 5
    await user.save()
  }
  if (answer != null) {
    answer.votes += 1
    await answer.save()
    res.json({ status: 'SUCCESS', msg: 'Answer vote count increased successfully' })
  } else {
    res.json({ status: 'ERROR', msg: 'Unable to increase answer vote' })
  }
})

router.route('/decrease/vote/').post(async (req, res) => {
  const answer = await AnswerModel.findById(req.body.id)
  const user = await UserModel.findOne({ email: answer.ans_by })
  if (user != null) {
    user.reputation -= 10
    await user.save()
  }
  if (answer != null) {
    answer.votes -= 1
    await answer.save()
    res.json({ status: 'SUCCESS', msg: 'Answer vote count decreased successfully' })
  } else {
    res.json({ status: 'ERROR', msg: 'Unable to decrease answer vote' })
  }
})

router.route('/delete').post(async (req, res) => {
  try {
    const answer = await AnswerModel.findById(req.body.id)
    if (answer != null) {
      for (const i in answer.comments) {
        await CommentModel.findByIdAndDelete(answer.comments[i])
      }
      const question = await QuestionModel.find({ answers: answer._id.toString() })
      if (question.length > 0) {
        question[0].answers = question[0].answers.filter(e => e !== answer._id.toString())
        await question[0].save()
      }
      await AnswerModel.findByIdAndDelete(req.body.id)
      res.status(200).json({ message: 'Answer deleted successfully' })
    } else {
      return res.status(404).json({ error: 'Answer not found' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
