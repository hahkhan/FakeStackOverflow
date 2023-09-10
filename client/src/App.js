// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css'
import FakeStackOverflow from './components/fakestackoverflow.js'
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Model from './model.js'

axios.defaults.withCredentials = true

function App () {
  // eslint-disable-next-line no-unused-vars
  const [model, setModel] = useState(new Model())
  const [page, setPage] = useState('welcome')

  useEffect(() => {
    async function checkForSession () {
      const res = await model.getSessionUserAsync()
      if (res[0]) {
        setPage('valid')
      }
    }
    checkForSession()
  }, [model])

  function WelcomePage () {
    return (
      <>
        <div id='header' className='header'>
          <h1>Fake Stack Overflow</h1>
        </div>
        <div className='main' style = {{ backgroundColor: '#fee3cd' }}>
          <div className='container additional-container-styles'>
            <button className='btn-question' onClick={() => {
              setPage('login')
            }}>Login</button>
            <button className='btn-question' onClick={() => {
              setPage('register')
            }}>Register</button>
            <button className='btn-question' onClick={() => {
              model.loginAsGuest()
              setPage('valid')
            }}>Continue as a Guest</button>
          </div>
        </div>
      </>
    )
  }

  function LoginPage () {
    const emailRef = useRef(null)
    const passwordRef = useRef(null)
    const [error, setError] = useState('')

    async function handleSubmit (event) {
      event.preventDefault()
      const res = await model.loginAsync(emailRef.current.value, passwordRef.current.value)
      if (res[0]) {
        setPage('valid')
      } else {
        setError(res[1])
      }
    }

    return (
      <>
        <div id='header' className='header'>
          <h1>Fake Stack Overflow</h1>
        </div>
        <div className='main'>
          <div className='container additional-container-styles' >
            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Email:</label>
              <br />
              <input type="text" id="email" ref={emailRef} required/>
              <br />
              <br />
              <label htmlFor="password">Password:</label>
              <br />
              <input type="password" id="password" ref={passwordRef} required/>
              <br />
              <br />
              <div className='footer'>
              <button className='btn-question' style ={{ padding: '10px 1em' }} type='button' onClick={() => {
                setPage('welcome')
              }}>
                  Back
                </button>
                <button className ='btn-question' style ={{ padding: '10px 1em' }} type="submit">Login</button>
              </div>
              <label className='error'>{error}</label>
            </form>
          </div>
        </div>
      </>
    )
  }

  function RegisterPage () {
    const usernameRef = useRef(null)
    const emailRef = useRef(null)
    const passwordRef = useRef(null)
    const confirmPasswordRef = useRef(null)
    const [error, setError] = useState('')

    async function handleSubmit (e) {
      e.preventDefault()
      const username = usernameRef.current.value
      const email = emailRef.current.value
      const password = passwordRef.current.value
      const confirmPassword = confirmPasswordRef.current.value
      if (password !== confirmPassword) {
        setError('The passwords do not match')
      } else {
        const res = await model.signupAsync(email, password, username)
        if (res[0]) {
          setPage('login')
        } else {
          setError(res[1])
        }
      }
    }

    return (
      <>
        <div id='header' className='header'>
          <h1>Fake Stack Overflow</h1>
        </div>
        <div className='main'>
          < div className='container additional-container-styles'>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <br />
                <input type="text" id="username" ref={usernameRef} required/>
                <br />
                <br />
                <label htmlFor="email">Email:</label>
                <br />
                <input type="email" id="email" ref={emailRef} required/>
                <br />
                <br />
                <label htmlFor="password">Password:</label>
                <br />
                <input type="password" id="password" ref={passwordRef} required/>
                <br />
                <br />
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <br />
                <input type="password" id="confirmPassword" ref={confirmPasswordRef} required/>
                <br />
                <br />
                <div className='footer'>
                <button className= 'btn-question' style ={{ padding: '10px 1em' }} type='button' onClick={() => {
                  setPage('welcome')
                }}>Back</button>
                  <button className='btn-question' style ={{ padding: '10px 1em' }} type="submit">Register</button>
              </div>
              <label className ='error'>{error}</label>
            </form>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
    {page === 'welcome' && <WelcomePage />}
    {page === 'login' && <LoginPage />}
    {page === 'register' && <RegisterPage />}
    {page === 'valid' && <FakeStackOverflow model={model} loginCallback={() => setPage('login')} logoutCallback={() => setPage('welcome')}/>}
    </>
  )
}

export default App
