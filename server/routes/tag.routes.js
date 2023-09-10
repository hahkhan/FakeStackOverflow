const express = require('express')
const router = express.Router()
const TagModel = require('./../models/tag.js')
const QuestionModel = require('./../models/question.js')

router.route('/lookup/all').get(async (req, res) => {
  const tags = await TagModel.find()
  res.json({ status: 'SUCCESS', tags, msg: 'Tags retrieved successfully' })
})

router.route('/lookup/id/:id').get(async (req, res) => {
  const tag = await TagModel.findById(req.params.id)
  if (tag == null) {
    res.json({ status: 'ERROR', msg: 'No tag found with the provided id' })
  } else {
    res.json({ status: 'SUCCESS', tag, msg: 'Tag found successfully' })
  }
})

router.route('/lookup/belonging/:userEmail').get(async (req, res) => {
  const tagsWithUser = await TagModel.find({ users: req.params.userEmail })
  const tags = []
  for (const i in tagsWithUser) {
    const tagWithUser = tagsWithUser[i]
    if (tagWithUser.users.length === 1) {
      tags.push(tagWithUser)
    }
  }
  res.json({ status: 'SUCCESS', tags, msg: 'Tag found successfully' })
})

router.route('/query/qcount/:id').get(async (req, res) => {
  const questions = Array.from(await QuestionModel.find({ tags: req.params.id }))
  res.json({ status: 'SUCCESS', qcount: questions.length, msg: 'Question count found successfully' })
})

router.route('/delete').post(async (req, res) => {
  try {
    const tag = await TagModel.findById(req.body.id)
    if (tag != null) {
      const questions = await QuestionModel.find({ tags: tag._id.toString() })
      for (const i in questions) {
        const question = questions[i]
        question.tags = question.tags.filter(e => e !== tag._id.toString())
        await question.save()
      }
      await TagModel.findByIdAndDelete(req.body.id)
      res.status(200).json({ message: 'Tag deleted successfully' })
    } else {
      return res.status(404).json({ error: 'Tag not found' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.route('/update').post(async (req, res) => {
  const tag = await TagModel.findById(req.body.id)
  if (tag != null) {
    tag.name = req.body.name
    tag.save()
      .then(() => res.status(200).json('Tag updated successfully'))
      .catch((err) => res.status(400).json({ errors: err }))
  } else {
    res.status(400).json('Unable to find a tag with the provided id')
  }
})

module.exports = router
