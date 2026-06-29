export default function Field({ label, helper, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {helper ? <span className="field-help">{helper}</span> : null}
    </label>
  )
}
