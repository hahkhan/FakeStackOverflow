// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const Question = require('./models/question.js')
const Tag = require('./models/tag.js')
const Answer = require('./models/answer.js')
const Comment = require('./models/comment.js')
const User = require('./models/user.js')
const bcrypt = require('bcrypt')

const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/fake_so', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

function tagCreate (name) {
  const tag = new Tag({ name })
  return tag.save()
}

function commentCreate (by, text, com_date_time, votes) {
  const commentdetail = { by, text }
  if (com_date_time !== false) commentdetail.com_date_time = com_date_time
  if (votes !== false) commentdetail.votes = votes

  return new Comment(commentdetail).save()
}

function answerCreate (text, ans_by, ans_date_time, votes, comments) {
  const answerdetail = { text, ans_by, comments: comments.map(x => x._id) }
  if (ans_date_time !== false) answerdetail.ans_date_time = ans_date_time
  if (votes !== false) answerdetail.votes = votes

  return new Answer(answerdetail).save()
}

function questionCreate (title, summary, text, tags, answers, asked_by, ask_date_time, views, votes, comments) {
  const qstndetail = {
    title,
    summary,
    text,
    tags: tags.map(x => x._id),
    asked_by,
    comments: comments.map(x => x._id)
  }
  if (answers !== false) qstndetail.answers = answers.map(x => x._id)
  if (ask_date_time !== false) qstndetail.ask_date_time = ask_date_time
  if (views !== false) qstndetail.views = views
  if (votes !== false) qstndetail.votes = votes
  return new Question(qstndetail).save()
}

function userCreate (email, password, username, reputation, created, isAdmin) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        reject(err)
      }
      const userdetail = {
        email,
        password: hash,
        username,
        reputation,
        created,
        isAdmin
      }
      const newUser = await new User(userdetail).save()
      resolve(newUser)
    })
  })
}

const populate = async () => {
  const admin = await userCreate(process.argv[2], process.argv[3], process.argv[2], Number.MAX_VALUE, Date.parse('01 Jan 2022 00:00:00 GMT'), true)
  const user1 = await userCreate('test1@stonybrook.edu', 'abc123!', 'test1', 50, Date.parse('26 Jan 2023 00:00:00 GMT'), false)
  const user2 = await userCreate('test2@stonybrook.edu', 'abc123!', 'test2', 100, Date.parse('27 Jan 2023 00:00:00 GMT'), false)
  const user3 = await userCreate('test3@stonybrook.edu', 'abc123!', 'test3', 20, Date.parse('28 Jan 2023 00:00:00 GMT'), false)
  const user4 = await userCreate('test4@stonybrook.edu', 'abc123!', 'test4', 0, Date.parse('29 Jan 2023 00:00:00 GMT'), false)
  const tag1 = await tagCreate('code')
  const tag2 = await tagCreate('javascript')
  const tag3 = await tagCreate('csharp')
  const comment1 = await commentCreate(user2.email, 'hi', Date.parse('27 Feb 2023 00:00:00 GMT'), 0)
  const comment2 = await commentCreate(user1.email, 'idk', Date.parse('27 Feb 2023 00:00:00 GMT'), 1)
  const answer1 = await answerCreate('React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.', user1.email, Date.parse('16 Feb 2023 00:00:00 GMT'), 5, [comment1])
  const answer2 = await answerCreate('On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.', user2.email, Date.parse('16 Feb 2023 00:00:00 GMT'), 5, [])
  const question1 = await questionCreate('How to code?', 'I wish I knew', 'Any tips?', [tag1, tag2], [answer1, answer2], user3.email, Date.parse('25 Feb 2023 00:00:00 GMT'), 20, 10, [comment2])
  if (db) db.close()
}

populate()
  .then(() => console.log('done'))
  .catch((err) => {
    console.log('ERROR: ' + err)
    if (db) db.close()
  })

console.log('processing ...')
