import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'

const metrics = [
  { label: 'Loads in view', value: '128', tone: 'info' },
  { label: 'On-time target', value: '96%', tone: 'success' },
  { label: 'Planning lanes', value: '24', tone: 'warning' },
]

const foundationAreas = [
  {
    title: 'Shipment visibility',
    text: 'A future command view for load status, milestones, and exceptions.',
  },
  {
    title: 'Dispatch planning',
    text: 'A clean workspace prepared for routing, assignments, and daily planning.',
  },
  {
    title: 'Fleet operations',
    text: 'A visual foundation for tractors, trailers, driver availability, and utilization.',
  },
  {
    title: 'AI-assisted insights',
    text: 'Reserved UI space for future recommendations, risk flags, and optimization cues.',
  },
]

export default function Overview() {
  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <Badge tone="info">Milestone 1 foundation</Badge>
          <h2>Transportation command center for modern logistics teams.</h2>
          <p>
            This React frontend establishes the TransportFlow AI visual direction,
            layout system, and static dashboard foundation before functional TMS
            modules are added in later milestones.
          </p>
        </div>
        <div className="hero-card">
          <p className="eyebrow">Current scope</p>
          <strong>UI/UX Design & Setup</strong>
          <span>No backend, APIs, auth, or live workflow logic.</span>
        </div>
      </section>

      <section className="metric-grid" aria-label="Static product metrics">
        {metrics.map((metric) => (
          <Card className="metric-card" key={metric.label}>
            <Badge tone={metric.tone}>{metric.label}</Badge>
            <strong>{metric.value}</strong>
            <span>Static placeholder</span>
          </Card>
        ))}
      </section>

      <section className="content-grid">
        {foundationAreas.map((area) => (
          <Card title={area.title} eyebrow="Prepared UI area" key={area.title}>
            <p>{area.text}</p>
          </Card>
        ))}
      </section>
    </div>
  )
}
