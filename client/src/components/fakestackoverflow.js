import React, { useState } from 'react'
import HomePage from './homepage.js'
import TagPage from './tagpage.js'
import AskPage from './askpage.js'
import QuestionPage from './questionpage.js'
import AnswerPage from './answerpage.js'
import UserProfile from './userprofile.js'
import AdminProfile from './adminpage.js'
import Model from '../model.js'

const DropdownMenu = ({ model, logoutCallback, setPage }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className='dropdown'>
      <button className='btn-toggle' onClick={handleToggle}>{model.loginUser.username} ▾</button>
      {isOpen && (
        <ul className='dropdown-menu'>
            <li onClick={() => {
              setPage('profile')
              handleToggle()
            }}>User Profile</li>
            <li style={{ display: model.loginUser.isAdmin ? 'inline-block' : 'none' }} onClick={() => {
              setPage('admin-profile')
              handleToggle()
            }}>Admin Profile</li>
            <li onClick={async () => {
              await model.logoutAsync()
              logoutCallback()
              handleToggle()
            }}>
            Logout
          </li>
        </ul>
      )}
    </div>
  )
}

export default function FakeStackOverflow ({ model, loginCallback, logoutCallback }) {
  const [page, setPage] = useState('home')
  const [search, setSearch] = useState(undefined)
  const [qid, setQid] = useState('')
  const [ansId, setAnsId] = useState('')
  const [editing, setEditing] = useState(false)
  const [newModel, setNewModel] = useState(undefined)

  return (
    <>
      <div id='header' className='header'>
        {model.loginUser.email !== 'GUEST'
          ? <DropdownMenu model={model} logoutCallback={logoutCallback} setPage={setPage}/>
          : (<div>
            <button className='btn-toggle' style={{ marginLeft: '12%' }} onClick={loginCallback}>Login</button>
          </div>
            )
        }
        <h1 style={{ whiteSpace: 'nowrap' }}>Fake Stack Overflow</h1>
        <input
          id='txtSearch'
          type='text'
          placeholder='Search . . .'
          name='search'
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setPage('home')
              setSearch(e.target.value)
              setEditing(false)
            }
          }}
        />

      </div>
      <div id='main' className='main'>
        <div className='sidebar'>
          <ul id='sidebarList'>
            <li id='navItemQuestions' style={{ backgroundColor: page === 'home' ? 'lightgray' : 'white' }} onClick={() => {
              setPage('home')
              setSearch(undefined)
              setEditing(false)
            }}>❓ All Questions</li>
            <li id='navItemTags' style={{ backgroundColor: page === 'tag' ? 'lightgray' : 'white' }} onClick={() => {
              setPage('tag')
              setSearch(undefined)
              setEditing(false)
            }}>🏷️ All Tags</li>
          </ul>
        </div>
        <button id='btnAskQuestion' className='btn-question' style={{ display: page === 'ask' || page === 'answer' || page === 'profile' || model.loginUser.email === 'GUEST' ? 'none' : 'inline-block' }} onClick={() => {
          setPage('ask')
          setSearch(undefined)
          setEditing(false)
        }}>Ask Question</button>
        <div className='content' id='content'>
          {page === 'home' && <HomePage model={model} search={search} questionClickCallback={async (qid, updateViews) => {
            // Update Views Count
            if (updateViews) {
              await model.increaseQuestionViewCountAsync(qid)
            }
            // Change Page
            setPage('question')
            setQid(qid)
            setSearch(undefined)
            setEditing(false)
          }}></HomePage>}
          {page === 'tag' && <TagPage model={model} tagClickedCallback={(tagName) => {
            setPage('home')
            setSearch(`[${tagName}]`)
            setEditing(false)
          }}></TagPage>}
          {page === 'ask' && <AskPage model={model} setPage={setPage} editing={editing} qid={qid}></AskPage>}
          {page === 'question' && <QuestionPage model={model} qid={qid} setPage={setPage}></QuestionPage>}
          {page === 'answer' && <AnswerPage model={model} qid={qid} setPage={setPage} editing={editing} ansId={ansId}></AnswerPage>}
          {page === 'profile' && <UserProfile model={model} setMainPage={setPage} setQid={setQid} setAnsId={setAnsId} setEditing={setEditing} tagClickedCallback={(tagName) => {
            setPage('home')
            setSearch(`[${tagName}]`)
            setEditing(false)
          }}></UserProfile>}
          {page === 'profile-2' && <UserProfile model={newModel} setMainPage={setPage} setQid={setQid} setAnsId={setAnsId} setEditing={setEditing} tagClickedCallback={(tagName) => {
            setPage('home')
            setSearch(`[${tagName}]`)
            setEditing(false)
          }}></UserProfile>}
          {page === 'admin-profile' && <AdminProfile model={model} logoutCallback={logoutCallback} mimicUser={async (email) => {
            const res = await model.getUserByEmailAsync(email)
            if (res[0]) {
              setNewModel(new Model(res[0]))
              setPage('profile-2')
            }
          }}></AdminProfile>}
        </div>
      </div>
    </>
  )
}
