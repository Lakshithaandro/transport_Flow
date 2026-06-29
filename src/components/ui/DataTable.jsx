import EmptyState from './EmptyState.jsx'

export default function DataTable({ columns, rows, getRowKey, emptyTitle = 'No records found', emptyMessage }) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} message={emptyMessage || 'Adjust the filters or search query to see more records.'} />
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
