import React, { useState, useEffect } from 'react'
import Paginator from './paginator.js'
import { ProblemContainer } from './homepage.js'

function TagContainer ({ model, tag, tagClickedCallback, setMyTags }) {
  const [questionCount, setQuestionCount] = useState(0)

  useEffect(() => {
    async function getQuestionCount () {
      const res = await model.getTagQuestionCountAsync(tag._id)
      setQuestionCount(res[0])
    }
    getQuestionCount()
  }, [model, tag])

  return (
      <div key={tag.name} id={tag.name} className='tag-box'>
        <a href ='# ' onClick={(e) => {
          e.preventDefault()
          tagClickedCallback(tag.name)
        }}>{tag.name}</a>
        <br />
        <span className='count'>
          {questionCount} question
          {questionCount !== 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className='btn-modify' onClick={async () => {
              const newName = window.prompt('Tag Name:', tag.name)
              if (newName != null && newName !== '') {
                await model.updateTagAsync(tag._id, newName)
                const res = await model.getTagsBelongingToUserAsync(model.loginUser)
                setMyTags(res[0])
              }
            }}>✏️</button>
            <button className='btn-modify' onClick={async () => {
              await model.deleteTagAsync(tag._id)
              const res = await model.getTagsBelongingToUserAsync(model.loginUser)
              setMyTags(res[0])
            }}>❌</button>
        </div>
      </div>
  )
}

function AnswerContainer ({ model, answer, myAnswerClickCallback }) {
  const [ansUser, setAnsUser] = useState(undefined)
  const answerText = answer.text.replace(/\[([\w\s\d]+)\]\((https?:\/\/[\w\d./?=#]+)\)/g, '<a href="$2" target="_blank">$1</a>')

  useEffect(() => {
    async function getInformation () {
      const res = await model.getUserByEmailAsync(answer.ans_by)
      setAnsUser(res[0])
    }
    getInformation()
  }, [model, answer])

  return (
        <div key={answer._id} className='problem-container' style={{ display: 'flex', justifyContent: 'space-around', cursor: 'auto' }} onClick={() => {
          if (answer.ans_by === model.loginUser.email) {
            myAnswerClickCallback()
          }
        }}>
            <div className='question-main' style={{ flex: '1' }}>
                {
                    answer.ans_by === model.loginUser.email
                      ? (
                        <a href='# ' onClick={(e) => e.preventDefault()} style={{ display: 'inline-block', textDecoration: 'none', color: '#007bff', fontSize: 'larger', marginLeft: '3ch', width: '100%' }}>{answer.text}</a>
                        )
                      : (
                        <p style={{ marginLeft: '3ch' }} dangerouslySetInnerHTML={{ __html: answerText }}></p>
                        )
                }
            </div>
            <div className='question-metadata' style={{ paddingInline: '3em', alignSelf: 'center', color: '#666' }}>
                <span className='username' style={{ color: 'green' }}>{ansUser === undefined ? '' : ansUser.username}</span>
                <br /> answered <span className='date'>{model.getTimeFromNow(answer.ans_date_time)}</span>
            </div>
        </div>
  )
}

function QuestionAnswerList ({ model, question, setMainPage, setQid, setAnsId, setEditing }) {
  const [answers, setAnswers] = useState([])

  useEffect(() => {
    async function getInformation () {
      const res = await model.getAnswersFromQuestionIdForUserAsync(question._id, model.loginUser)
      setAnswers(res[0])
    }
    getInformation()
  }, [model, question])

  return (
        <Paginator objs={answers.map((ans) => <AnswerContainer key={ans._id} model={model} answer={ans} myAnswerClickCallback={() => {
          setMainPage('answer')
          setQid(question._id)
          setAnsId(ans._id)
          setEditing(true)
        }}/>)} itemsPerPage={5}></Paginator>
  )
}

export default function UserProfile ({ model, setMainPage, setQid, setAnsId, setEditing, tagClickedCallback }) {
  const [page, setPage] = useState('questions')
  const [myAskedQuestions, setMyAskedQuestions] = useState([])
  const [myAnsweredQuestions, setMyAnsweredQuestions] = useState([])
  const [myTags, setMyTags] = useState([])
  const [question, setQuestion] = useState(undefined)

  useEffect(() => {
    async function getInformation () {
      const res = await model.getAskedQuestionsFromUserAsync(model.loginUser)
      const res2 = await model.getAnsweredQuestionsFromUserAsync(model.loginUser)
      const res3 = await model.getTagsBelongingToUserAsync(model.loginUser)
      setMyAskedQuestions(res[0])
      setMyAnsweredQuestions(res2[0])
      setMyTags(res3[0])
    }
    getInformation()
  }, [model])

  return (
        <>
            <div className="user-profile">
                <div className="header" style={{
                  backgroundColor: '#1abc9c',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: '1rem'
                }}>
                    <div className='user-statistics' style={{ display: 'flex' }}>
                        <img src={'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'} alt={'User Profile'} style={{ height: '50px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'center', marginLeft: '3ch' }}>
                            <span>Hello, {model.loginUser.username}!</span>
                            <span>Joined: {model.getTimeFromNow(model.loginUser.created)}</span>
                            <span>You have a reputation of {model.loginUser.reputation} points</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className='btn-toggle' onClick={() => setPage('questions')}>My Questions</button>
                        <button className='btn-toggle' onClick={() => setPage('answers')}>My Answers</button>
                        <button className='btn-toggle' onClick={() => setPage('tags')}>My Tags</button>
                    </div>
                </div>
                <div className='content'>
                    {page === 'questions' && (
                        <div className="my-questions">
                            <div className='content-header'>
                                <h3 style={{ fontSize: 'x-large' }}>My Questions</h3>
                            </div>
                            <div className='questions' id = 'questions' style={{ marginLeft: '4ch', fontWeight: '550' }}>
                                <span className='count' id = 'count'>{myAskedQuestions.length} question{myAskedQuestions.length !== 1 ? 's' : ''}</span>
                            </div>
                            {<Paginator objs={myAskedQuestions.map(q => {
                              return (
                                    <div key={q._id} className='problem-container' style={{ color: '#666' }} onClick={() => {
                                      setMainPage('ask')
                                      setQid(q._id)
                                      setEditing(true)
                                    }}>
                                        <div className='question-main'>
                                            <a href='# ' onClick={(e) => e.preventDefault()} style={{ display: 'inline-block', textDecoration: 'none', color: '#007bff', fontSize: 'larger', marginLeft: '3ch', width: '100%' }}>{q.title}</a>
                                        </div>
                                    </div>
                              )
                            })} itemsPerPage={5} />}
                        </div>
                    )}
                    {page === 'answers' && (
                        <div className="my-answers">
                            <div className='content-header'>
                                <h3 style={{ fontSize: 'x-large' }}>My Answered Questions</h3>
                            </div>
                            <div className='questions' id = 'questions' style={{ marginLeft: '4ch', fontWeight: '550' }}>
                                <span className='count' id = 'count'>{myAnsweredQuestions.length} answered question{myAnsweredQuestions.length !== 1 ? 's' : ''}</span>
                            </div>
                            {<Paginator objs={myAnsweredQuestions.map(q => {
                              return (<ProblemContainer key={q._id} model={model} question={q} questionClickCallback={() => {
                                setPage('edit-answers')
                                setQuestion(q)
                              }} />)
                            })} itemsPerPage={5} />}
                        </div>
                    )}
                    {page === 'tags' && (
                        <div className="my-tags">
                            <div className='content-header'>
                                <h3 style={{ fontSize: 'x-large' }}>My Tags</h3>
                            </div>
                            <div className='container' style={{ marginLeft: '25px', fontWeight: '700', fontSize: 'x-large' }}>
                                <div className='start'>
                                    <span className='count'>
                                        {myTags.length} Tag
                                        {myTags.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                            {myTags.length === 0
                              ? <h2 style={{ textAlign: 'center', margin: '100px 0 0 0' }}>{`No Tags Belonging to ${model.loginUser.email} Found`}</h2>
                              : (
                                <div className='grid-container' style={{ marginTop: '50px', marginBottom: '50px' }}>
                                    {myTags.map((tag) => (
                                        <TagContainer key={tag._id} model={model} tag={tag} tagClickedCallback={tagClickedCallback} setMyTags={setMyTags}/>
                                    ))}
                                </div>
                                )}
                        </div>
                    )}
                    {page === 'edit-answers' && (
                        <div>
                            <div className='content-header'>
                                <h3 style={{ fontSize: 'x-large' }}>Answers for {question.title}</h3>
                            </div>
                            <QuestionAnswerList model={model} question={question} setMainPage={setMainPage} setQid={setQid} setAnsId={setAnsId} setEditing={setEditing}/>
                        </div>
                    )}
                </div>
            </div>
        </>
  )
}
