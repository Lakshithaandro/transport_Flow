import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'

const colors = [
  { name: 'Primary', className: 'swatch-primary' },
  { name: 'Surface', className: 'swatch-surface' },
  { name: 'Success', className: 'swatch-success' },
  { name: 'Warning', className: 'swatch-warning' },
]

export default function DesignSystem() {
  return (
    <div className="page-stack">
      <section className="section-heading">
        <Badge tone="info">Design reference</Badge>
        <h2>TransportFlow AI interface foundation</h2>
        <p>
          Static primitives for the Milestone 1 frontend setup: color, type,
          badges, cards, and button styling.
        </p>
      </section>

      <section className="content-grid">
        <Card eyebrow="Color tokens" title="Core palette">
          <div className="swatch-grid">
            {colors.map((color) => (
              <div className="swatch-item" key={color.name}>
                <span className={`swatch ${color.className}`} />
                <strong>{color.name}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card eyebrow="Status labels" title="Badge styles">
          <div className="inline-group">
            <Badge>Neutral</Badge>
            <Badge tone="info">Info</Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
          </div>
        </Card>

        <Card eyebrow="Actions" title="Button styling">
          <div className="inline-group">
            <span className="button button-primary">Primary action</span>
            <span className="button button-secondary">Secondary action</span>
          </div>
        </Card>

        <Card eyebrow="Typography" title="Readable operations UI">
          <p>
            Headings use a strong logistics-dashboard tone while body copy stays
            compact and easy to scan for operations teams.
          </p>
        </Card>
      </section>
    </div>
  )
}
