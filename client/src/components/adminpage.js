import React, { useState, useEffect } from 'react'
import Paginator from './paginator.js'

export default function AdminProfile ({ model, mimicUser, logoutCallback }) {
  const [users, setUsers] = useState([])

  useEffect(() => {
    async function getInformation () {
      const res = await model.getAllUsersAsync()
      setUsers(res[0])
    }
    getInformation()
  }, [model])

  async function handleDeleteUser (email) {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?')

    if (confirmDelete) {
      const res = await model.deleteUserAsync(model.loginUser, email)
      if (res[0]) {
        const res1 = await model.getAllUsersAsync()
        setUsers(res1[0])
        if (model.loginUser.email === email) {
          logoutCallback()
        }
      }
    }
  }

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
                        <img src={'https://us.123rf.com/450wm/donets/donets1508/donets150800333/43440158-vector-user-icon-of-man-in-business-suit.jpg?ver=6'} alt={'User Profile'} style={{ height: '50px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'center', marginLeft: '3ch' }}>
                            <span>Joined: {model.getTimeFromNow(model.loginUser.created)}</span>
                            <span>You have a reputation of {model.loginUser.reputation} points</span>
                        </div>
                    </div>
                </div>
                <div className="all-users">
                    <div className='content-header'>
                        <h3 style={{ fontSize: 'x-large' }}>All Users</h3>
                    </div>
                    <div className='users' id = 'users' style={{ marginLeft: '4ch', fontWeight: '550' }}>
                        <span className='count' id = 'count'>{users.length} user{users.length !== 1 ? 's' : ''}</span>
                    </div>
                    {<Paginator objs={users.map(u => {
                      return (
                            <div key={u._id} className='problem-container' style={{ display: 'flex', color: '#666', justifyContent: 'space-around', border: '1px solid #ddd' }}>
                                <div className='question-main' style={{ flex: '1' }}>
                                    <a href='# ' onClick={async (e) => {
                                      e.preventDefault()
                                      await mimicUser(u.email)
                                    }} style={{ display: 'inline-block', textDecoration: 'none', color: '#007bff', fontSize: 'larger', marginLeft: '3ch', width: '100%' }}>
                                        {u.username}
                                        <br></br>
                                        {u.email}
                                    </a>
                                </div>
                                <div className='question-metadata'>
                                    <button className='btn-modify' style={{ marginRight: '3ch', padding: '15px' }} onClick={() => handleDeleteUser(u.email)}>❌</button>
                                </div>
                            </div>
                      )
                    })} itemsPerPage={10} />}
                </div>
            </div>
        </>
  )
}
