import React, { useState, useEffect } from 'react'

function TagContainer ({ model, tag, tagClickedCallback }) {
  const [questionCount, setQuestionCount] = useState(0)

  useEffect(() => {
    async function getQuestionCount () {
      const res = await model.getTagQuestionCountAsync(tag._id)
      setQuestionCount(res[0])
    }
    getQuestionCount()
  }, [model, tag])

  return (
      <div key={tag.name} id={tag.name} className='tag-box' onClick={() => tagClickedCallback(tag.name)}>
        <a href ='# ' onClick={(e) => e.preventDefault()}>{tag.name}</a>
        <br />
        <span className='count'>
          {questionCount} question
          {questionCount !== 1 ? 's' : ''}
        </span>
      </div>
  )
}

export default function TagPage ({ model, tagClickedCallback }) {
  const [tags, setTags] = useState([])

  useEffect(() => {
    async function getTags () {
      const res = await model.getAllTagsAsync()
      setTags(res[0])
    }
    getTags()
  }, [model])

  return (
        <>
            <div className='container' style={{ marginLeft: '25px', fontWeight: '700', fontSize: 'x-large' }}>
                <div className='start'>
                    <span className='count'>
                        {tags.length} Tag
                        {tags.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className='center' style={{ margin: 'auto' }}>
                    All Tags
                </div>
            </div>
            {tags.length === 0
              ? <h2 style={{ textAlign: 'center', margin: '100px 0 0 0' }}>No Tags Found</h2>
              : (
                <div className='grid-container' style={{ marginBlock: '40px' }}>
                    {tags.map((tag) => (
                        <TagContainer key={tag._id} model={model} tag={tag} tagClickedCallback={tagClickedCallback}/>
                    ))}
                </div>
                )}
        </>
  )
}
