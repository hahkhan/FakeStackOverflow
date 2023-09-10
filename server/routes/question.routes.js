const express = require('express')
const router = express.Router()
const QuestionModel = require('./../models/question.js')
const UserModel = require('./../models/user.js')
const TagModel = require('./../models/tag.js')
const CommentModel = require('./../models/comment.js')
const AnswerModel = require('./../models/answer.js')

router.route('/lookup/all').get(async (req, res) => {
  const questions = await QuestionModel.find()
  res.json({ status: 'SUCCESS', questions, msg: 'Questions retrieved successfully' })
})

router.route('/lookup/asked/:userEmail').get(async (req, res) => {
  const questions = await QuestionModel.find({ asked_by: req.params.userEmail })
  questions.sort((a, b) => {
    return new Date(b.ask_date_time) - new Date(a.ask_date_time)
  })
  res.json({ status: 'SUCCESS', questions, msg: 'Questions retrieved successfully' })
})

router.route('/lookup/answered/:userEmail').get(async (req, res) => {
  const answers = await AnswerModel.find({ ans_by: req.params.userEmail })
  const qids = []
  const questions = []
  for (const i in answers) {
    const answer = answers[i]
    const question = await QuestionModel.find({ answers: answer._id.toString() })
    if (question.length > 0) {
      if (!qids.includes(question[0]._id.toString())) {
        questions.push(question[0])
        qids.push(question[0]._id.toString())
      }
    }
  }
  questions.sort((a, b) => {
    return new Date(b.ask_date_time) - new Date(a.ask_date_time)
  })
  res.json({ status: 'SUCCESS', questions, msg: 'Questions retrieved successfully' })
})

router.route('/lookup/id/:id').get(async (req, res) => {
  const question = await QuestionModel.findById(req.params.id)
  if (question != null) {
    res.json({ status: 'SUCCESS', question, msg: 'Question retrieved successfully' })
  } else {
    res.json({ status: 'ERROR', msg: 'No question was found with the provided id' })
  }
})

router.route('/search/:string').get(async (req, res) => {
  const questions = Array.from(await QuestionModel.find())
  const search = req.params.string.toLowerCase()
  const fields = search.split(/\[|\s/)
  const questionsToRender = []
  for (const i in fields) {
    if (fields[i] === '') {
      continue
    } else if (fields[i].slice(-1) === ']') {
      for (const j in questions) {
        const question = questions[j]
        for (const k in question.tags) {
          const tag = await TagModel.findById(question.tags[k])
          if (tag.name.toLowerCase() === fields[i].slice(0, -1)) {
            if (!questionsToRender.includes(question)) {
              questionsToRender.push(question)
            }
            break
          }
        }
      }
    } else {
      for (const j in questions) {
        const question = questions[j]
        const questionText = question.text.replace(/\[([\w\s\d]+)\]\((https?:\/\/[\w\d./?=#]+)\)/g, '$1 $2')
        if (question.title.toLowerCase().split(' ').includes(fields[i]) || questionText.toLowerCase().split(' ').includes(fields[i])) {
          if (!questionsToRender.includes(question)) {
            questionsToRender.push(question)
          }
          continue
        }
      }
    }
  }
  res.json({ status: 'SUCCESS', questions: questionsToRender, msg: 'Questions retrieved successfully' })
})

router.route('/sort/:type').get(async (req, res) => {
  if (req.params.type === 'newest') {
    const questionsToRender = Array.from(await QuestionModel.find())
    questionsToRender.sort((a, b) => {
      return new Date(b.ask_date_time) - new Date(a.ask_date_time)
    })
    res.json({ status: 'SUCCESS', questions: questionsToRender, msg: 'Questions retrieved successfully' })
  } else if (req.params.type === 'active') {
    const questionsToRender = Array.from(await QuestionModel.find())
    questionsToRender.sort((a, b) => {
      let aAnsDate = Number.MIN_VALUE
      let bAnsDate = Number.MIN_VALUE
      if (a.answers.length > 0) {
        aAnsDate = a.answers
          .map(async (id) => {
            const answer = await AnswerModel.findById(id)
            // eslint-disable-next-line no-new
            new Date(answer.ans_date_time)
          })
          .reduce((acc, val) => {
            return acc > val ? acc : val
          })
      }
      if (b.answers.length > 0) {
        bAnsDate = b.answers
          .map(async (id) => {
            const answer = await AnswerModel.findById(id)
            // eslint-disable-next-line no-new
            new Date(answer.ans_date_time)
          })
          .reduce((acc, val) => {
            return acc > val ? acc : val
          })
      }
      return bAnsDate - aAnsDate
    })
    res.json({ status: 'SUCCESS', questions: questionsToRender, msg: 'Questions retrieved successfully' })
  } else if (req.params.type === 'unanswered') {
    const questions = Array.from(await QuestionModel.find())
    const questionsToRender = []
    for (const i in questions) {
      const question = questions[i]
      if (question.answers.length === 0) {
        questionsToRender.push(question)
        continue
      }
    }
    res.json({ status: 'SUCCESS', questions: questionsToRender, msg: 'Questions retrieved successfully' })
  } else {
    res.json({ status: 'ERROR', msg: 'Invalid sort type' })
  }
})

router.route('/new').post(async (req, res) => {
  const errorMessages = []
  if (req.body.title.length > 50) {
    errorMessages.push('The title must have a maximum of 50 characters')
  }
  if (req.body.summary.length > 140) {
    errorMessages.push('The summary must have a maximum of 140 characters')
  }
  if (req.body.tags === '') {
    errorMessages.push('Tags cannot be empty')
  } else if (req.body.tags.split(' ').length > 5) {
    errorMessages.push('You can only have a maximum of 5 tags')
  } else if (req.body.tags.split(' ').filter(x => x.length > 10).length >= 1) {
    errorMessages.push('The length of a tag must be a maximum of 10 characters')
  }
  // eslint-disable-next-line no-useless-escape
  if (req.body.text.match(/\[[^\]]*\]\s*\((?:(?!https?:\/\/)[^\)]+)*\)/g)) {
    errorMessages.push('The text contains an invalid hyperlink')
  } else if (req.body.text.match(/\[(?![\w\s\d]+)\]\((https?:\/\/[\w\d./?=#]+)\)/g)) {
    errorMessages.push('The text contains an invalid hyperlink')
  }

  if (errorMessages.length) {
    res.status(400).json({ errors: errorMessages })
    return
  }
  // Populate Tags
  const tags = []
  if (req.body.tags !== '') {
    const tagNames = [...new Set(req.body.tags.toLowerCase().trim().split(' '))]
    for (const tagName of tagNames) {
      const tag = await TagModel.findOne({ name: tagName })
      if (tag == null) {
        if (req.body.user.reputation >= 50) {
          const newTag = new TagModel({
            name: tagName,
            users: [req.body.user.email]
          })
          await newTag.save()
          tags.push(newTag._id.toString())
        } else {
          errorMessages.push(`The tag with name "${tagName}" could not be created since your reputation is less than 50`)
          res.status(400).json({ errors: errorMessages })
          return
        }
      } else {
        if (!tag.users.includes(req.body.user.email)) {
          tag.users.push(req.body.user.email)
          await tag.save()
        }
        tags.push(tag._id.toString())
      }
    }
  }
  // Make New Question
  const question = new QuestionModel({
    title: req.body.title,
    summary: req.body.summary,
    text: req.body.text,
    tags,
    asked_by: req.body.user.email,
    ask_date_time: new Date()
  })
  question.save()
    .then(() => res.status(200).json('Question saved successfully'))
    .catch((err) => res.status(400).json({ errors: err }))
})

router.route('/comment').post(async (req, res) => {
  const question = await QuestionModel.findById(req.body.id)
  if (question == null) {
    res.json({ status: 'ERROR', msg: 'No question was found with the provided id' })
  } else if (req.body.text === '') {
    res.json({ status: 'ERROR', msg: 'The comment text cannot be empty' })
  } else if (req.body.text.length > 140) {
    res.json({ status: 'ERROR', msg: 'The comment text must have a maximum of 140 characters' })
  } else if (req.body.user.reputation < 50) {
    res.json({ status: 'ERROR', msg: 'You can not post a comment, you have a reputation less than 50 points' })
  } else {
    // Make Comment
    const comment = new CommentModel({
      by: req.body.user.email,
      text: req.body.text,
      com_date_time: new Date()
    })
    // Associate comment with question
    question.comments.push(comment._id.toString())
    await question.save()
    comment.save()
      .then(() => res.json({ status: 'SUCCESS', msg: 'Comment saved successfully' }))
      .catch((err) => res.json({ status: 'ERROR', msg: err }))
  }
})

router.route('/increase/view/').post(async (req, res) => {
  const question = await QuestionModel.findById(req.body.id)
  question.views += 1
  question.save()
    .then(() => res.json({ status: 'SUCCESS', msg: 'Question view count increased successfully' }))
    .catch((err) => res.json({ status: 'ERROR', msg: err }))
})

router.route('/increase/vote/').post(async (req, res) => {
  const question = await QuestionModel.findById(req.body.id)
  const user = await UserModel.findOne({ email: question.asked_by })
  if (user != null) {
    user.reputation += 5
    await user.save()
  }
  if (question != null) {
    question.votes += 1
    await question.save()
    res.json({ status: 'SUCCESS', msg: 'Question vote count increased successfully' })
  } else {
    res.json({ status: 'ERROR', msg: 'Unable to increase question vote' })
  }
})

router.route('/decrease/vote/').post(async (req, res) => {
  const question = await QuestionModel.findById(req.body.id)
  const user = await UserModel.findOne({ email: question.asked_by })
  if (user != null) {
    user.reputation -= 10
    await user.save()
  }
  if (question != null) {
    question.votes -= 1
    await question.save()
    res.json({ status: 'SUCCESS', msg: 'Question vote count decreased successfully' })
  } else {
    res.json({ status: 'ERROR', msg: 'Unable to decrease question vote' })
  }
})

router.route('/delete').post(async (req, res) => {
  try {
    const question = await QuestionModel.findById(req.body.id)
    if (question != null) {
      for (const i in question.answers) {
        for (const j in question.answers[i].comments) {
          await CommentModel.findByIdAndDelete(question.answers[i].comments[j])
        }
        await AnswerModel.findByIdAndDelete(question.answers[i])
      }
      for (const i in question.comments) {
        await CommentModel.findByIdAndDelete(question.comments[i])
      }
      await QuestionModel.findByIdAndDelete(req.body.id)
      res.status(200).json({ message: 'Question deleted successfully' })
    } else {
      return res.status(404).json({ error: 'Question not found' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.route('/update').post(async (req, res) => {
  const question = await QuestionModel.findById(req.body.id)
  if (question != null) {
    const errorMessages = []
    if (req.body.title.length > 50) {
      errorMessages.push('The title must have a maximum of 50 characters')
    }
    if (req.body.summary.length > 140) {
      errorMessages.push('The summary must have a maximum of 140 characters')
    }
    if (req.body.tags.split(' ').length > 5) {
      errorMessages.push('You can only have a maximum of 5 tags')
    }
    if (req.body.tags.split(' ').filter(x => x.length > 10).length >= 1) {
      errorMessages.push('The length of a tag must be a maximum of 10 characters')
    }
    // eslint-disable-next-line no-useless-escape
    if (req.body.text.match(/\[[^\]]*\]\s*\((?:(?!https?:\/\/)[^\)]+)*\)/g)) {
      errorMessages.push('The text contains an invalid hyperlink')
    } else if (req.body.text.match(/\[(?![\w\s\d]+)\]\((https?:\/\/[\w\d./?=#]+)\)/g)) {
      errorMessages.push('The text contains an invalid hyperlink')
    }
    if (errorMessages.length) {
      res.status(400).json({ errors: errorMessages })
      return
    }
    // Populate Tags
    const tags = []
    if (req.body.tags !== '') {
      const tagNames = [...new Set(req.body.tags.toLowerCase().trim().split(' '))]
      for (const tagName of tagNames) {
        const tag = await TagModel.findOne({ name: tagName })
        if (tag == null) {
          if (req.body.user.reputation >= 50) {
            const newTag = new TagModel({
              name: tagName,
              users: [req.body.user.email]
            })
            await newTag.save()
            tags.push(newTag._id.toString())
          } else {
            errorMessages.push(`The tag with name "${tagName}" could not be created since your reputation is less than 50`)
            res.status(400).json({ errors: errorMessages })
            return
          }
        } else {
          if (!tag.users.includes(req.body.user.email)) {
            tag.users.push(req.body.user.email)
            await tag.save()
          }
          tags.push(tag._id.toString())
        }
      }
    }
    // Make New Question
    question.title = req.body.title
    question.summary = req.body.summary
    question.text = req.body.text
    question.tags = tags
    question.save()
      .then(() => res.status(200).json('Question updated successfully'))
      .catch((err) => res.status(400).json({ errors: err }))
  } else {
    res.status(400).json('Unable to find a question with the provided id')
  }
})

module.exports = router
