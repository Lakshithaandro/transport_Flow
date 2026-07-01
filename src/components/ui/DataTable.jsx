import { useMemo, useState } from 'react'
import EmptyState from './EmptyState.jsx'

export default function DataTable({
  columns,
  rows,
  getRowKey,
  emptyTitle = 'No records found',
  emptyMessage,
  pageSize = 8,
  enablePagination = true,
}) {
  const [page, setPage] = useState(1)
  const totalPages = enablePagination ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1
  const currentPage = Math.min(page, totalPages)

  const visibleRows = useMemo(() => {
    if (!enablePagination) return rows
    const start = (currentPage - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [currentPage, enablePagination, pageSize, rows])

  if (!rows.length) {
    return <EmptyState title={emptyTitle} message={emptyMessage || 'Adjust the filters or search query to see more records.'} />
  }

  const firstRow = enablePagination ? (currentPage - 1) * pageSize + 1 : 1
  const lastRow = enablePagination ? Math.min(currentPage * pageSize, rows.length) : rows.length

  return (
    <>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th className={column.align === 'right' ? 'cell-number' : column.className || ''} key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => {
                  const classNames = [column.align === 'right' ? 'cell-number' : '', column.className || ''].filter(Boolean).join(' ')
                  return <td className={classNames} key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span className="table-meta">Showing {firstRow}-{lastRow} of {rows.length}</span>
        {enablePagination && totalPages > 1 ? (
          <div className="table-pagination" aria-label="Table pagination">
            <button className="button button-secondary button-small" type="button" disabled={currentPage === 1} onClick={() => setPage((pageValue) => Math.max(1, pageValue - 1))}>
              Previous
            </button>
            <span className="table-meta">Page {currentPage} of {totalPages}</span>
            <button className="button button-secondary button-small" type="button" disabled={currentPage === totalPages} onClick={() => setPage((pageValue) => Math.min(totalPages, pageValue + 1))}>
              Next
            </button>
          </div>
        ) : null}
      </div>
    </>
  )
}
