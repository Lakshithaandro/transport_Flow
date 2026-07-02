import Badge from './Badge.jsx'
import Card from './Card.jsx'

export default function StatCard({ label, value, helper, tone = 'info' }) {
  return (
    <Card className="metric-card stat-card">
      <Badge tone={tone}>{label}</Badge>
      <strong>{value}</strong>
      {helper ? <span>{helper}</span> : null}
    </Card>
  )
}
