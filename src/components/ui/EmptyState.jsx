export default function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {message ? <p>{message}</p> : null}
      {action ? <div className="empty-state-actions">{action}</div> : null}
    </div>
  )
}
