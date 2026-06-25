import Badge from '../ui/Badge.jsx'

export default function Topbar() {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Transportation Management System</p>
        <h1>UI/UX Design & Setup</h1>
      </div>
      <div className="topbar-actions">
        <Badge tone="success">Frontend Ready</Badge>
        <div className="company-chip">Demo Logistics Co.</div>
      </div>
    </header>
  )
}
