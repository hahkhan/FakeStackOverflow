import React, { useState, useEffect, useRef } from 'react'

export default function AskPage ({ model, setPage, editing, qid }) {
  const titleRef = useRef(null)
  const summaryRef = useRef(null)
  const textRef = useRef(null)
  const tagsRef = useRef(null)
  const [error, setError] = useState({})
  const [debouncedSubmit, setDebouncedSubmit] = useState(null)

  useEffect(() => {
    async function getInformation () {
      if (editing) {
        const res = await model.getQuestionByIdAsync(qid)
        const question = res[0]
        const tags = []
        for (const i in question.tags) {
          const tagId = question.tags[i]
          const res = await model.getTagByIdAsync(tagId)
          tags.push(res[0].name)
        }
        titleRef.current.value = question.title
        summaryRef.current.value = question.summary
        textRef.current.value = question.text
        tagsRef.current.value = tags.join(' ')
      }
    }
    getInformation()
  }, [model, qid, editing])

  async function handleSubmit (e) {
    e.preventDefault()
    try {
      if (!editing) {
        await model.addQuestionAsync(model.loginUser, titleRef.current.value, summaryRef.current.value, textRef.current.value, tagsRef.current.value)
      } else {
        await model.updateQuestionAsync(qid, model.loginUser, titleRef.current.value, summaryRef.current.value, textRef.current.value, tagsRef.current.value)
      }
      setError({})
      setPage('home')
    } catch (err) {
      const error = { title: '', summary: '', text: '', tags: '' }
      err.response.data.errors.forEach(e => {
        if (e.includes('title')) {
          error.title = e
        }
        if (e.includes('summary')) {
          error.summary = e
        }
        if (e.includes('text')) {
          error.text = e
        }
        if (e.includes('tag')) {
          error.tags += e + '\n'
        }
      })
      setError(error)
    }
  }

  function handleDebouncedSubmit (e) {
    e.preventDefault()
    if (debouncedSubmit) {
      clearTimeout(debouncedSubmit)
    }
    setDebouncedSubmit(setTimeout(() => {
      handleSubmit(e)
    }, 350))
  }

  return (
        <div className='container' >
            <form onSubmit={handleDebouncedSubmit}>
              <label htmlFor="title">Title*:</label>
              <br />
              <input type="text" id="title" ref={titleRef} required/>
              <p className='error'>{error.title || ''}</p>
              <br />
              <label htmlFor="summary">Summary*:</label>
              <br />
              <input type="text" id="summary" ref={summaryRef} required/>
              <p className='error'>{error.summary || ''}</p>
              <br />
              <label htmlFor="text">Text*:</label>
              <br />
              <textarea type="text" id="txtText" ref={textRef} required/>
              <p className='error'>{error.text || ''}</p>
              <br />
              <label htmlFor="tags">Tags*:</label>
              <br />
              <p><i>Add keywords separated by whitespace</i></p>
              <input type="text" id="tags" ref={tagsRef} required/>
              <p className='error' style={{ fontSize: '.8rem', whiteSpace: 'pre-wrap' }}>{error.tags || ''}</p>
              <br />
              <div className='footer' style={{ marginTop: '30px' }}>
                <button className ='btn-question' type="submit">Post Question</button>
                <span>* indicates mandatory fields</span>
              </div>
              <br />
              <button className ='btn-question' type='button' style={{ display: editing ? 'inline-block' : 'none' }} onClick={async () => {
                await model.deleteQuestionAsync(qid)
                setError({})
                setPage('home')
              }}>Delete</button>
            </form>
        </div>
  )
}
