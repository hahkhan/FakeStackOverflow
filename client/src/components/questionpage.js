import React, { useState, useEffect, useRef } from 'react'
import Paginator from './paginator.js'

function Tag ({ tag }) {
  return (
        <div className='tag'>
            {tag.name}
        </div>
  )
}

function CommentContainer ({ model, comment }) {
  const [comUser, setComUser] = useState(undefined)
  const [comVotes, setComVotes] = useState(comment.votes)

  useEffect(() => {
    async function getUser () {
      const res = await model.getUserByEmailAsync(comment.by)
      setComUser(res[0])
    }
    getUser()
  }, [model, comment])

  return (
        <div key={comment._id} style={{ paddingLeft: '3ch', display: 'flex', justifyContent: 'space-around', border: '1px solid #ddd' }}>
            <div className='dynamic' style={{ justifyContent: 'center' }}>
                <span className='container' style={{ margin: '0', flexDirection: 'column', alignItems: 'flex-start', fontSize: '.8rem' }}>
                    <button className='upvote' style={{ display: model.loginUser.email === 'GUEST' || (comment !== undefined && model.loginUser.email === comment.by) ? 'none' : 'inline-block' }} onClick={async () => {
                      const res = await model.increaseCommentVoteCountAsync(comment._id)
                      if (res[0]) {
                        setComVotes(comVotes + 1)
                      }
                    }}>▲</button>
                    <br />
                    <span className='votes' style={{ fontWeight: '600', textAlign: 'center' }}>
                        {comVotes} vote{comVotes !== 1 ? 's' : ''}
                    </span>
                </span>
            </div>
            <div className='question-main' style={{ flex: '1' }}>
                <p style={{ marginLeft: '3ch', color: '#444', marginBlock: '2ch 0' }} dangerouslySetInnerHTML={{ __html: comment.text }}></p>
            </div>
            <div className='question-metadata' style={{ paddingInline: '3em', alignSelf: 'center', color: '#666' }}>
                <span className='username' style={{ color: 'green' }}>
                    {comUser === undefined ? '' : comUser.username}
                </span>
                <br /> commented <span className='date'>{model.getTimeFromNow(comment.com_date_time)}</span>
            </div>
        </div>
  )
}

function AnswerContainer ({ model, answer }) {
  const [ansUser, setAnsUser] = useState(undefined)
  const [answerVotes, setAnswerVotes] = useState(answer.votes)
  const [comments, setComments] = useState([])
  const [error, setError] = useState('')
  const commentTextRef = useRef(null)
  const answerText = answer.text.replace(/\[([\w\s\d]+)\]\((https?:\/\/[\w\d./?=#]+)\)/g, '<a href="$2" target="_blank">$1</a>')

  useEffect(() => {
    async function getInformation () {
      const res = await model.getUserByEmailAsync(answer.ans_by)
      const res2 = await model.getCommentsFromAnswerIdAsync(answer._id)
      setAnsUser(res[0])
      setComments(res2[0])
    }
    getInformation()
  }, [model, answer])

  return (
        <>
            <div key={answer._id} className='problem-container' style={{ display: 'flex', justifyContent: 'space-around', cursor: 'auto' }}>
                    <div className='dynamic'>
                        <span className='container' style={{ margin: '0', flexDirection: 'column', alignItems: 'flex-start', fontSize: '.8rem' }}>
                            <button disabled={model.loginUser.reputation < 50} className='upvote' style={{ display: model.loginUser.email === 'GUEST' || (answer !== undefined && model.loginUser.email === answer.ans_by) ? 'none' : 'inline-block' }} onClick={async () => {
                              const res = await model.increaseAnswerVoteCountAsync(answer._id)
                              if (res[0]) {
                                setAnswerVotes(answerVotes + 1)
                              }
                            }}>▲</button>
                            <span className='votes' style={{ fontWeight: '600' }}>
                                {answerVotes} vote{answerVotes !== 1 ? 's' : ''}
                            </span>
                            <button disabled={model.loginUser.reputation < 50} className='downvote' style={{ display: model.loginUser.email === 'GUEST' || (answer !== undefined && model.loginUser.email === answer.ans_by) ? 'none' : 'inline-block' }} onClick={async () => {
                              const res = await model.decreaseAnswerVoteCountAsync(answer._id)
                              if (res[0]) {
                                setAnswerVotes(answerVotes - 1)
                              }
                            }}>▼</button>
                        </span>
                    </div>
                    <div className='question-main' style={{ flex: '1' }}>
                        <p style={{ marginLeft: '3ch' }} dangerouslySetInnerHTML={{ __html: answerText }}></p>
                    </div>
                    <div className='question-metadata' style={{ paddingInline: '3em', alignSelf: 'center', color: '#666' }}>
                        <span className='username' style={{ color: 'green' }}>
                            {ansUser === undefined ? '' : ansUser.username}
                        </span>
                        <br /> answered <span className='date'>{model.getTimeFromNow(answer.ans_date_time)}</span>
                    </div>
            </div>
            <div className='comment-section'>
                <span style={{ marginLeft: '2ch', color: '#9897A9' }}>Comments</span>
                {<Paginator objs={comments.map((com) => <CommentContainer key={com._id} model={model} comment={com}/>)} itemsPerPage={3}></Paginator>}
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  const res = await model.addAnswerCommentAsync(model.loginUser, answer._id, commentTextRef.current.value)
                  if (res[0]) {
                    const res2 = await model.getCommentsFromAnswerIdAsync(answer._id)
                    setError('')
                    setComments(res2[0])
                  } else {
                    setError(res[1])
                  }
                }
                    }>
                    <input
                        style={{ display: model.loginUser.email === 'GUEST' ? 'none' : 'inline-block' }}
                        ref={commentTextRef}
                        placeholder='Add a comment'
                     />
                     <p className='error'>{error || ''}</p>
                    <input type="submit" style={{ display: 'none' }} />
                </form>
            </div>
        </>
  )
}

export default function QuestionPage ({ model, qid, setPage }) {
  const [question, setQuestion] = useState(undefined)
  const [questionText, setQuestionText] = useState('')
  const [questionVotes, setQuestionVotes] = useState(0)
  const [askedUser, setAskedUser] = useState(undefined)
  const [answers, setAnswers] = useState([])
  const [tags, setTags] = useState([])
  const [comments, setComments] = useState([])
  const [error, setError] = useState('')
  const commentTextRef = useRef(null)

  useEffect(() => {
    async function getInformation () {
      const res = await model.getQuestionByIdAsync(qid)
      const res1 = await model.getUserByEmailAsync(res[0].asked_by)
      const res2 = await model.getAnswersFromQuestionIdAsync(qid)
      const t = []
      for (const i in res[0].tags) {
        const tag = res[0].tags[i]
        const res3 = await model.getTagByIdAsync(tag)
        t.push(res3[0])
      }
      const res4 = await model.getCommentsFromQuestionIdAsync(qid)
      setQuestion(res[0])
      setQuestionText(res[0].text.replace(/\[([\w\s\d]+)\]\((https?:\/\/[\w\d./?=#]+)\)/g, '<a href="$2" target="_blank">$1</a>'))
      setQuestionVotes(res[0].votes)
      setAskedUser(res1[0])
      setAnswers(res2[0])
      setComments(res4[0])
      setTags(t)
    }
    getInformation()
  }, [model, qid])

  return (
        <>
            <div className='container' style={{ marginLeft: '25px', fontWeight: '700', fontSize: 'larger' }}>
                <div className='start'>
                    <span className='count'>
                        {answers.length} answer
                        {answers.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className='center' style={{ margin: 'auto', maxWidth: '875px' }}>
                    {question !== undefined ? question.title : ''}
                </div>
            </div>
            < div style={{ overflowY: 'auto', maxHeight: '85%' }}>
                <div className='problem-container' style={{ borderStyle: 'none', alignItems: 'center', cursor: 'auto' }}>
                    <div className='dynamic'>
                        <span className='views' style={{ fontWeight: '600' }}>
                            {question !== undefined ? question.views : 0} view{(question !== undefined ? question.views : 0) !== 1 ? 's' : ''}
                        </span>
                        <span className='container' style={{ margin: '.5rem 0', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <button disabled={model.loginUser.reputation < 50} className='upvote' style={{ display: model.loginUser.email === 'GUEST' || (question !== undefined && model.loginUser.email === question.asked_by) ? 'none' : 'inline-block' }} onClick={async () => {
                              const res = await model.increaseQuestionVoteCountAsync(qid)
                              if (res[0]) {
                                setQuestionVotes(questionVotes + 1)
                              }
                            }}>▲</button>
                            <span className='votes' style={{ fontWeight: '600', margin: '0.5em 0' }}>
                                {questionVotes} vote{questionVotes !== 1 ? 's' : ''}
                            </span>
                            <button disabled={model.loginUser.reputation < 50} className='downvote' style={{ display: model.loginUser.email === 'GUEST' || (question !== undefined && model.loginUser.email === question.asked_by) ? 'none' : 'inline-block' }} onClick={async () => {
                              const res = await model.decreaseQuestionVoteCountAsync(qid)
                              if (res[0]) {
                                setQuestionVotes(questionVotes - 1)
                              }
                            }}>▼</button>
                        </span>
                    </div>
                    <div className='question-main'>
                        <p dangerouslySetInnerHTML={{ __html: questionText }}></p>
                        <div className='tag-wrapper'>
                            {tags.map((t) => <Tag key={t._id} tag={t}></Tag>)}
                        </div>
                    </div>
                    <div className='question-metadata' style={{ paddingInlineStart: '.5em' }}>
                        <span className='username' style={{ color: 'red' }}>
                            {askedUser === undefined ? '' : askedUser.username}
                        </span>
                        <br /> asked <span className='date'>{model.getTimeFromNow(question !== undefined ? question.ask_date_time : new Date())}</span>
                    </div>
                </div>
                <div className='comment-section'>
                    <span style={{ marginLeft: '2ch', color: '#9897A9' }}>Comments:</span>
                    {<Paginator objs={comments.map((com) => <CommentContainer key={com._id} model={model} comment={com}/>)} itemsPerPage={3}></Paginator>}
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      const res = await model.addQuestionCommentAsync(model.loginUser, qid, commentTextRef.current.value)
                      if (res[0]) {
                        const res2 = await model.getCommentsFromQuestionIdAsync(qid)
                        setError('')
                        setComments(res2[0])
                      } else {
                        setError(res[1])
                      }
                    }
                        }>
                        <input
                            style={{ display: model.loginUser.email === 'GUEST' ? 'none' : 'inline-block' }}
                            ref={commentTextRef}
                            placeholder='Add a comment'
                        />
                        <p className='error'>{error || ''}</p>
                        <input type="submit" style={{ display: 'none' }} />
                    </form>
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0 1.2rem 0' }}>
                        <span style={{ marginLeft: '2ch', color: '#9897A9' }}>Answers:</span>
                        <button id='btnAnswerQuestion' className='btn-toggle' style={{ margin: '0 2ch 0 0', display: model.loginUser.email === 'GUEST' ? 'none' : 'inline-block' }} onClick={() => setPage('answer')}>Answer Question</button>
                    </div>
                    {<Paginator objs={answers.map((ans) => <AnswerContainer key={ans._id} model={model} answer={ans}/>)} itemsPerPage={5}></Paginator>}
                </div>
            </div>
        </>
  )
}
