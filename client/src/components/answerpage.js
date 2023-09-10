import React, { useState, useRef, useEffect } from 'react'

export default function AnswerPage ({ model, qid, setPage, editing, ansId }) {
  const textRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function getInformation () {
      if (editing) {
        const res = await model.getAnswerByIdAsync(ansId)
        textRef.current.value = res[0].text
      }
    }
    getInformation()
  }, [model, ansId, editing])

  async function handleSubmit (e) {
    e.preventDefault()
    setSubmitting(true)
    let res
    if (!editing) {
      res = await model.addAnswerAsync(model.loginUser, qid, textRef.current.value)
    } else {
      res = await model.updateAnswerAsync(ansId, textRef.current.value)
    }
    if (res[0]) {
      setError('')
      setPage('question')
    } else {
      setError(res[1])
    }
    setSubmitting(false)
  }

  return (
        <div className='container'>
            <form>
                <label htmlFor='txtText'>Answer Text*</label>
                <br />
                <br />
                <textarea id='txtText' ref={textRef} type='text' required></textarea>
                <br />
                <br />
                <label className='error'>{error}</label>
                <br />
                <div className='footer' style={{ marginTop: '30px' }}>
                    <input id='btnPostAnswer' className="btn-question" type='submit' value='Post Answer' onClick={handleSubmit} disabled={submitting}></input>
                    <span>* indicated mandatory field</span>
                </div>
                <br />
                <button className ='btn-question' type='button' style={{ display: editing ? 'inline-block' : 'none' }} onClick={async () => {
                  await model.deleteAnswerAsync(ansId)
                  setError('')
                  setPage('question')
                }}>Delete</button>
            </form>
        </div>
  )
}
