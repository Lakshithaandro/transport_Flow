export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="inline-group">
          <button className="button button-primary" type="button" onClick={onConfirm}>{confirmLabel}</button>
          <button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </section>
    </div>
  )
}
