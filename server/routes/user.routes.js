const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const UserModel = require('./../models/user.js')
const QuestionModel = require('./../models/question.js')
const AnswerModel = require('./../models/answer.js')
const CommentModel = require('./../models/comment.js')
const TagModel = require('./../models/tag.js')

router.route('/lookup/all').get(async (req, res) => {
  const users = await UserModel.find()
  res.json({ status: 'SUCCESS', users, msg: 'Users retrieved successfully' })
})

router.route('/session').get(async (req, res) => {
  if (req.session.email) {
    const user = await UserModel.findOne({ email: req.session.email })
    res.json({ status: user == null ? 'ERROR' : 'SUCCESS', user, msg: user == null ? 'The session is no longer valid' : 'The user was logged in successfully' })
  } else {
    res.json({ status: 'ERROR', msg: 'The session is no longer valid' })
  }
})

router.route('/signup').post(async (req, res) => {
  if (await UserModel.exists({ email: req.body.email })) {
    res.json({ status: 'ERROR', msg: 'A user with this email already exists' })
  } else if (req.body.password.includes(req.body.email.split('@')[0]) || req.body.password.includes(req.body.username)) {
    res.json({ status: 'ERROR', msg: 'The password cannot contain the email nor the username' })
  } else {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        res.json({ status: 'ERROR', msg: 'Unable to hash the password' })
      } else {
        const user = new UserModel({
          email: req.body.email,
          password: hash,
          username: req.body.username,
          created: new Date()
        })
        user.save()
        res.json({ status: 'SUCCESS', msg: 'The user was added successfully' })
      }
    })
  }
})

router.route('/login').post(async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email })
  if (user == null) {
    res.json({ status: 'ERROR', msg: 'No user exists with the provided email' })
  } else {
    bcrypt.compare(req.body.password, user.password, (_err, result) => {
      if (!result) {
        res.json({ status: 'ERROR', msg: 'The password was invalid' })
      } else {
        req.session.email = user.email
        res.json({ status: 'SUCCESS', user, msg: 'The user was logged in successfully' })
        req.session.save()
      }
    })
  }
})

router.route('/logout').post(async (req, res) => {
  if (req.session.email) {
    req.session.destroy()
  }
  res.json({ status: 'SUCCESS', msg: 'The user was logged out successfully' })
})

router.route('/lookup/email/:email').get(async (req, res) => {
  const user = await UserModel.findOne({ email: req.params.email })
  if (user == null) {
    res.json({ status: 'ERROR', msg: 'No user found with the provided email' })
  } else {
    res.json({ status: 'SUCCESS', user, msg: 'User found successfully' })
  }
})

router.route('/delete').post(async (req, res) => {
  if (req.body.user.isAdmin) {
    const user = await UserModel.findOne({ email: req.body.email })
    if (user == null) {
      res.json({ status: 'ERROR', msg: 'No user exists with the provided email' })
    } else {
      // ==Delete Questions
      const questions = await QuestionModel.find({ asked_by: user.email })
      for (const i in questions) {
        const question = questions[i]
        // Delete Question Answers
        for (const j in question.answers) {
          for (const k in question.answers[j].comments) {
            await CommentModel.findByIdAndDelete(question.answers[j].comments[k])
          }
          await AnswerModel.findByIdAndDelete(question.answers[j])
        }
        // Delete Question Comments
        for (const j in question.comments) {
          await CommentModel.findByIdAndDelete(question.comments[j])
        }
        await QuestionModel.findByIdAndDelete(question._id)
      }
      // ==Delete Answers
      const answers = await AnswerModel.find({ ans_by: user.email })
      for (const i in answers) {
        const answer = answers[i]
        // Delete Answer Comments
        for (const j in answer.comments) {
          await CommentModel.findByIdAndDelete(answer.comments[j])
        }
        // Disassociate answer from question
        const question = await QuestionModel.find({ answers: answer._id.toString() })
        if (question.length > 0) {
          question[0].answers = question[0].answers.filter(e => e !== answer._id.toString())
          await question[0].save()
        }
        await AnswerModel.findByIdAndDelete(answer._id)
      }
      // ==Delete Comments
      const comments = await CommentModel.find({ by: user.email })
      for (const i in comments) {
        const comment = comments[i]
        // Disassociate comment from answer
        const answer = await AnswerModel.find({ comments: comment._id.toString() })
        if (answer.length > 0) {
          answer[0].comments = answer[0].comments.filter(e => e !== comment._id.toString())
          await answer[0].save()
        }
        // Disassociate comment from question
        const question = await QuestionModel.find({ comments: comment._id.toString() })
        if (question.length > 0) {
          question[0].comments = question[0].comments.filter(e => e !== comment._id.toString())
          await question[0].save()
        }
        await CommentModel.findByIdAndDelete(comment._id)
      }
      // ==Delete Tags
      const tagsWithUser = await TagModel.find({ users: user.email })
      const tags = []
      for (const i in tagsWithUser) {
        const tagWithUser = tagsWithUser[i]
        if (tagWithUser.users.length === 1) {
          tags.push(tagWithUser)
        }
      }
      for (const i in tags) {
        const tag = tags[i]
        const questionsWithTags = await QuestionModel.find({ tags: tag._id.toString() })
        for (const i in questionsWithTags) {
          const question = questionsWithTags[i]
          question.tags = question.tags.filter(e => e !== tag._id.toString())
          await question.save()
        }
        await TagModel.findByIdAndDelete(tag._id)
      }
      await UserModel.findByIdAndDelete(user._id)
      res.json({ status: 'SUCCESS', user, msg: 'The user was deleted successfully' })
    }
  } else {
    res.json({ status: 'ERROR', msg: 'Only an admin user can delete users' })
  }
})

module.exports = router
