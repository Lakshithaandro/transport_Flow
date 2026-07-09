export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        background: 'rgba(15, 23, 42, 0.45)',
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="auth-card"
        style={{ maxWidth: '440px' }}
      >
        <div className="section-heading compact-heading">
          <p className="eyebrow">Confirm action</p>
          <h2 id="confirm-modal-title">{title}</h2>
          <p>{message}</p>
        </div>
        <div className="inline-group">
          <button className="button button-danger" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="button button-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  )
}
