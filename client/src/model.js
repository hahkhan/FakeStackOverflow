import axios from 'axios'

export default class Model {
  constructor (loginUser = undefined) {
    this.loginUser = loginUser
  }

  // ===HELPERS===
  getTimeFromNow (date) {
    date = new Date(date)
    // Same Day
    if (((new Date() - date) / 1000) <= 86400) {
      let duration = (date - new Date()) / 1000
      const formatter = new Intl.RelativeTimeFormat(undefined, {
        numeric: 'always',
        style: 'long'
      })
      const TIME_PERIODS = [
        { amount: 60, name: 'seconds' },
        { amount: 60, name: 'minutes' },
        { amount: 24, name: 'hours' }
      ]
      for (let i = 0; i < TIME_PERIODS.length; i++) {
        const timePeriod = TIME_PERIODS[i]
        if (Math.abs(duration) < timePeriod.amount) {
          return formatter.format(Math.round(duration), timePeriod.name)
        }
        duration /= timePeriod.amount
      }
      return formatter
    } else if (date.getYear() === new Date().getYear()) { // Same Year
      return date.toLocaleString(undefined, { month: 'short', day: 'numeric' }) + ' at ' + date.toLocaleTimeString('it-IT', { hour: 'numeric', minute: 'numeric' })
    } else { // All Diff
      return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) + ' at ' + date.toLocaleTimeString('it-IT', { hour: 'numeric', minute: 'numeric' })
    }
  }

  // ===USERS===
  async getAllUsersAsync () {
    const res = await axios.get('http://localhost:8000/user/lookup/all/')
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.users) : [], res.data.msg]
  }

  async getUserByEmailAsync (email) {
    const res = await axios.get(`http://localhost:8000/user/lookup/email/${email}`)
    return [res.data.status === 'SUCCESS' ? res.data.user : undefined, res.data.msg]
  }

  async getSessionUserAsync () {
    const res = await axios.get('http://localhost:8000/user/session/')
    this.loginUser = res.data.status === 'SUCCESS' ? res.data.user : undefined
    return [this.loginUser !== undefined, res.data.msg]
  }

  async loginAsGuest () {
    this.loginUser = {
      email: 'GUEST',
      username: 'guest',
      reputation: 0,
      questions: [],
      answers: []
    }
  }

  async loginAsync (email, password) {
    const res = await axios.post('http://localhost:8000/user/login/', {
      email,
      password
    })
    this.loginUser = res.data.status === 'SUCCESS' ? res.data.user : undefined
    return [this.loginUser !== undefined, res.data.msg]
  }

  async signupAsync (email, password, username) {
    const res = await axios.post('http://localhost:8000/user/signup/', {
      email,
      password,
      username
    })
    return [res.data.status === 'SUCCESS', res.data.msg]
  }

  async logoutAsync () {
    const res = await axios.post('http://localhost:8000/user/logout/')
    this.loginUser = undefined
    return [res.data.status === 'SUCCESS', res.data.msg]
  }

  async deleteUserAsync (user, email) {
    const res = await axios.post('http://localhost:8000/user/delete/', {
      user,
      email
    })
    return [res.data.status === 'SUCCESS', res.data.msg]
  }

  // ===QUESTIONS===
  async getAllQuestionsAsync () {
    const res = await axios.get('http://localhost:8000/question/lookup/all/')
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.questions) : [], res.data.msg]
  }

  async getQuestionByIdAsync (id) {
    const res = await axios.get(`http://localhost:8000/question/lookup/id/${id}`)
    return [res.data.status === 'SUCCESS' ? res.data.question : undefined, res.data.msg]
  }

  async getAskedQuestionsFromUserAsync (user) {
    const res = await axios.get(`http://localhost:8000/question/lookup/asked/${user.email}`)
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.questions) : [], res.data.msg]
  }

  async getAnsweredQuestionsFromUserAsync (user) {
    const res = await axios.get(`http://localhost:8000/question/lookup/answered/${user.email}`)
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.questions) : [], res.data.msg]
  }

  async getQuestionsFromSearchAsync (search) {
    const res = await axios.get(`http://localhost:8000/question/search/${search}`)
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.questions) : [], res.data.msg]
  }

  async getQuestionsFromSortAsync (type) {
    const res = await axios.get(`http://localhost:8000/question/sort/${type}`)
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.questions) : [], res.data.msg]
  }

  async addQuestionAsync (user, title, summary, text, tags) {
    const res = await axios.post('http://localhost:8000/question/new/', {
      user,
      title,
      summary,
      text,
      tags
    })
    return [res.status === 201, res.data]
  }

  async addQuestionCommentAsync (user, id, text) {
    const res = await axios.post('http://localhost:8000/question/comment/', {
      user,
      id,
      text
    })
    return [res.data.status === 'SUCCESS', res.data.msg]
  }

  async increaseQuestionViewCountAsync (id) {
    const res = await axios.post('http://localhost:8000/question/increase/view/', {
      id
    })
    return [res.data.status === 'SUCCESS', res.data.msg]
  }

  async increaseQuestionVoteCountAsync (id) {
    const res = await axios.post('http://localhost:8000/question/increase/vote/', {
      id
    })
    return [res.data.status === 'SUCCESS', res.data.msg]
  }

  async decreaseQuestionVoteCountAsync (id) {
    const res = await axios.post('http://localhost:8000/question/decrease/vote/', {
      id
    })
    return [res.data.status === 'SUCCESS', res.data.msg]
  }

  async updateQuestionAsync (id, user, title, summary, text, tags) {
    const res = await axios.post('http://localhost:8000/question/update/', {
      id,
      user,
      title,
      summary,
      text,
      tags
    })
    return [res.status === 200, res.data]
  }

  async deleteQuestionAsync (id) {
    const res = await axios.post('http://localhost:8000/question/delete/', {
      id
    })
    return [res.status === 200, res.data]
  }

  // ===TAGS===
  async getAllTagsAsync () {
    const res = await axios.get('http://localhost:8000/tag/lookup/all/')
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.tags) : [], res.data.msg]
  }

  async getTagByIdAsync (id) {
    const res = await axios.get(`http://localhost:8000/tag/lookup/id/${id}`)
    return [res.data.status === 'SUCCESS' ? res.data.tag : undefined, res.data.msg]
  }

  async getTagsBelongingToUserAsync (user) {
    const res = await axios.get(`http://localhost:8000/tag/lookup/belonging/${user.email}`)
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.tags) : undefined, res.data.msg]
  }

  async getTagQuestionCountAsync (id) {
    const res = await axios.get(`http://localhost:8000/tag/query/qcount/${id}`)
    return [res.data.status === 'SUCCESS' ? res.data.qcount : 0, res.data.msg]
  }

  async deleteTagAsync (id) {
    const res = await axios.post('http://localhost:8000/tag/delete/', {
      id
    })
    return [res.status === 200, res.data]
  }

  async updateTagAsync (id, name) {
    const res = await axios.post('http://localhost:8000/tag/update/', {
      id,
      name
    })
    return [res.status === 200, res.data]
  }

  // ===ANSWERS===
  async getAllAnswersAsync () {
    const res = await axios.get('http://localhost:8000/answer/lookup/all/')
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.answers) : [], res.data.msg]
  }

  async getAnswerByIdAsync (id) {
    const res = await axios.get(`http://localhost:8000/answer/lookup/id/${id}`)
    return [res.data.status === 'SUCCESS' ? res.data.answer : undefined, res.data.msg]
  }

  async getAnswersFromQuestionIdAsync (id) {
    const res = await axios.get(`http://localhost:8000/answer/lookup/question/${id}`)
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.answers) : [], res.data.msg]
  }

  async getAnswersFromQuestionIdForUserAsync (id, user) {
    const res = await axios.get(`http://localhost:8000/answer/lookup/question/${id}/${user.email}`)
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.answers) : [], res.data.msg]
  }

  async addAnswerAsync (user, qid, text) {
    const res = await axios.post('http://localhost:8000/answer/new/', {
      user,
      text,
      qid
    })
    return [res.data.status === 'SUCCESS', res.data.msg]
  }

  async updateAnswerAsync (id, text) {
    const res = await axios.post('http://localhost:8000/answer/update/', {
      id,
      text
    })
    return [res.data.status === 'SUCCESS', res.data.msg]
  }

  async addAnswerCommentAsync (user, id, text) {
    const res = await axios.post('http://localhost:8000/answer/comment/', {
      user,
      id,
      text
    })
    return [res.data.status === 'SUCCESS', res.data.msg]
  }

  async increaseAnswerVoteCountAsync (id) {
    const res = await axios.post('http://localhost:8000/answer/increase/vote/', {
      id
    })
    return [res.data.status === 'SUCCESS', res.data.msg]
  }

  async decreaseAnswerVoteCountAsync (id) {
    const res = await axios.post('http://localhost:8000/answer/decrease/vote/', {
      id
    })
    return [res.data.status === 'SUCCESS', res.data.msg]
  }

  async deleteAnswerAsync (id) {
    const res = await axios.post('http://localhost:8000/answer/delete/', {
      id
    })
    return [res.status === 200, res.data]
  }

  //= =COMMENTS==
  async getAllCommentsAsync () {
    const res = await axios.get('http://localhost:8000/comment/lookup/all/')
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.comments) : [], res.data.msg]
  }

  async getCommentsFromQuestionIdAsync (id) {
    const res = await axios.get(`http://localhost:8000/comment/lookup/question/${id}`)
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.comments) : [], res.data.msg]
  }

  async getCommentsFromAnswerIdAsync (id) {
    const res = await axios.get(`http://localhost:8000/comment/lookup/answer/${id}`)
    return [res.data.status === 'SUCCESS' ? Array.from(res.data.comments) : [], res.data.msg]
  }

  async increaseCommentVoteCountAsync (id) {
    const res = await axios.post('http://localhost:8000/comment/increase/vote/', {
      id
    })
    return [res.data.status === 'SUCCESS', res.data.msg]
  }
}
