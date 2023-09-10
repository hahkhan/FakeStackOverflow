// Application server
const uri = 'mongodb://127.0.0.1:27017/fake_so'
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const session = require('express-session')

const app = express()

// App Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }), (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  next()
})
app.use(express.json())
app.use(session({
  secret: process.argv[2],
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 8 * 60 * 60 * 1000 }
}))

// Setup Mongo
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(8000, () => {
      console.log(`Server listening on port ${8000}`)
    })
  })
  .catch((err) => {
    console.log(err.message)
  })

// Ctrl+C
process.on('SIGINT', () => {
  mongoose.connection
    .close()
    .then(() => {
      console.log('\nServer closed. Database instance disconnected')
      process.exit(0)
    })
    .catch((err) => {
      console.log(err)
    })
})

// Routes
const userRoutes = require('./routes/user.routes.js')
app.use('/user', userRoutes)
const questionRoutes = require('./routes/question.routes.js')
app.use('/question', questionRoutes)
const tagRoutes = require('./routes/tag.routes.js')
app.use('/tag', tagRoutes)
const answerRoutes = require('./routes/answer.routes.js')
app.use('/answer', answerRoutes)
const commentRoutes = require('./routes/comment.routes.js')
app.use('/comment', commentRoutes)
