import React, { useState } from 'react'

export default function Paginator ({ objs, itemsPerPage }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(itemsPerPage - 1)

  const pageNumbers = []
  for (let i = 1; i <= Math.ceil(objs.length / itemsPerPage); i++) {
    pageNumbers.push(i)
  }

  function handlePageChange (newPage) {
    setCurrentPage(newPage)
    setEndIndex((newPage * itemsPerPage) - 1)
    setStartIndex(((newPage * itemsPerPage)) - itemsPerPage)
  }

  return (
        <>
            <>
                {objs.slice(startIndex, endIndex + 1).map(x => <>{x}</>)}
            </>
            <div className='paginator'>
                <button style={{ display: currentPage === 1 ? 'none' : 'inline-block' }} onClick={() => handlePageChange(currentPage - 1)}>⏴Previous</button>
                {pageNumbers.map((pageNum, i) => <button key={i} className={`btn-paginator ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => handlePageChange(i + 1)}>{pageNum}</button>)}
                <button style={{ display: pageNumbers.length === 0 || currentPage === pageNumbers.length ? 'none' : 'inline-block' }} onClick={() => handlePageChange(currentPage + 1)}>Next⏵</button>
            </div>
        </>
  )
}
