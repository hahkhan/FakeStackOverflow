import React, { useState, useEffect } from 'react'
import Paginator from './paginator.js'

function Tag ({ tag }) {
  return (
        <div className='tag'>
            {tag.name}
        </div>
  )
}

export function ProblemContainer ({ model, question, questionClickCallback }) {
  const [askedUser, setAskedUser] = useState(undefined)
  const [tags, setTags] = useState([])

  useEffect(() => {
    async function getUser () {
      const res = await model.getUserByEmailAsync(question.asked_by)
      setAskedUser(res[0])
    }
    async function getTags () {
      const t = []
      for (const i in question.tags) {
        const tag = question.tags[i]
        const res = await model.getTagByIdAsync(tag)
        t.push(res[0])
      }
      setTags(t)
    }
    getUser()
    getTags()
  }, [model, question])

  return (
        <div id={question._id} className='problem-container' style={{ color: '#666' }} onClick={() => questionClickCallback(question._id, true)}>
            <div className='dynamic'>
                <span className='answers'>{question.answers.length} answer{question.answers.length !== 1 ? 's' : ''}</span>
                <span className='views'>{question.views} view{question.views !== 1 ? 's' : ''}</span>
                <span className='votes'>{question.votes} vote{question.votes !== 1 ? 's' : ''}</span>
            </div>
            <div className='question-main'>
                <a key={question._id} href='# ' onClick={(e) => e.preventDefault()} style={{ textDecoration: 'none', color: '#007bff', fontSize: 'larger' }}>{question.title}</a>
                <p style={{ color: 'gray', fontSize: 'smaller' }}>{question.summary}</p>
                <div className='tag-wrapper'>
                    {tags.map((t) => <Tag key={t._id} tag={t}></Tag>)}
                </div>
            </div>
            <div className='question-metadata'>
                <span className='username' style={{ color: 'red' }}>{askedUser === undefined ? '' : askedUser.username}</span> asked <span className='date'>{model.getTimeFromNow(question.ask_date_time)}</span>
            </div>
        </div>
  )
}

export default function HomePage ({ model, search, questionClickCallback }) {
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    async function getSearch () {
      if (search !== undefined) {
        const res = await model.getQuestionsFromSearchAsync(search)
        setQuestions(res[0])
      }
    }
    getSearch()
  }, [model, search])

  useEffect(() => {
    async function getNewest () {
      const res = await model.getQuestionsFromSortAsync('newest')
      setQuestions(res[0])
    }
    getNewest()
  }, [model])

  return (
        <>
            <div className='content-header'>
                <h3 style={{ fontSize: 'x-large' }}>All Questions</h3>
            </div>
            <div className='wrapper'>
                <div className='questions' id = 'questions'>
                    <span className='count' id = 'count'>{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
                </div>
                <div className='buttons'>
                    <button className='btn-sort' id='newest' onClick={async () => {
                      const res = await model.getQuestionsFromSortAsync('newest')
                      setQuestions(res[0])
                    }}>Newest</button>
                    <button className='btn-sort' id='active' onClick={async () => {
                      const res = await model.getQuestionsFromSortAsync('active')
                      setQuestions(res[0])
                    }}>Active</button>
                    <button className='btn-sort' id='unanswered' onClick={async () => {
                      const res = await model.getQuestionsFromSortAsync('unanswered')
                      setQuestions(res[0])
                    }}>Unanswered</button>
                </div>
            </div>
            <div className='insert' id='insert' style={{ overflowY: 'auto', marginTop: '30px', maxHeight: '82%' }}>
                {questions.length === 0 ? <h2 style={{ textAlign: 'center', margin: '100px 0 0 0' }}>No Question Found</h2> : <Paginator objs={questions.map((q) => <ProblemContainer key={q._id} model={model} question={q} questionClickCallback={questionClickCallback}></ProblemContainer>)} itemsPerPage={5}></Paginator>}
            </div>
        </>
  )
}
