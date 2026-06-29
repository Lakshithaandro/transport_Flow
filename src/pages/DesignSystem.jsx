import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Field from '../components/ui/Field.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import Toolbar from '../components/ui/Toolbar.jsx'

const colors = [
  { name: 'Primary', className: 'swatch-primary' },
  { name: 'Surface', className: 'swatch-surface' },
  { name: 'Success', className: 'swatch-success' },
  { name: 'Warning', className: 'swatch-warning' },
]

const sampleColumns = [
  { key: 'unit', label: 'Vehicle' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

const sampleRows = [
  { unit: 'Tractor 101', type: 'Tractor', status: 'Available' },
  { unit: 'Trailer 545', type: 'Flatbed Trailer', status: 'Maintenance' },
]

export default function DesignSystem() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Design reference"
        title="TransportFlow AI interface foundation"
        description="Reusable primitives for Milestone 1 foundation and Milestone 2 authentication, vehicle, and driver management."
      />

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
            <Badge tone="danger">Error</Badge>
          </div>
        </Card>

        <Card eyebrow="Actions" title="Button styling">
          <div className="inline-group">
            <span className="button button-primary">Primary action</span>
            <span className="button button-secondary">Secondary action</span>
            <span className="button button-secondary button-small">Small action</span>
          </div>
        </Card>

        <Card eyebrow="Metrics" title="Stat card">
          <StatCard label="Vehicles" value="4" helper="Reusable KPI pattern" tone="info" />
        </Card>
      </section>

      <Card eyebrow="Toolbar and fields" title="Form controls">
        <Toolbar>
          <Field label="Search">
            <input className="form-control" placeholder="Search vehicles or drivers" />
          </Field>
          <Field label="Status">
            <select className="form-control" defaultValue="All">
              <option>All</option>
              <option>Available</option>
              <option>Maintenance</option>
            </select>
          </Field>
        </Toolbar>
      </Card>

      <Card className="table-shell" eyebrow="Tables" title="Data table">
        <DataTable columns={sampleColumns} rows={sampleRows} getRowKey={(row) => row.unit} />
      </Card>

      <EmptyState title="Empty state" message="Reusable message for filters, empty lists, and future no-data states." />
    </div>
  )
}
