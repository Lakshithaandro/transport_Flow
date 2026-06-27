import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import { initialDrivers, initialVehicles } from '../data/vehicleDriverData.js'

const milestoneAreas = [
  {
    title: 'Milestone 1 foundation',
    text: 'The React shell, sidebar, topbar, overview, design system, and responsive theme remain in place.',
  },
  {
    title: 'Mock authentication',
    text: 'A protected frontend session gates the app with demo credentials and a sign-out action.',
  },
  {
    title: 'Vehicle management',
    text: 'Vehicle records can be searched, filtered, and added locally without backend persistence.',
  },
  {
    title: 'Driver management',
    text: 'Driver records can be searched, filtered, and added locally for the corrected Milestone 2 scope.',
  },
]

export default function Overview() {
  const availableVehicles = initialVehicles.filter((vehicle) => vehicle.status === 'Available').length
  const availableDrivers = initialDrivers.filter((driver) => driver.status === 'Available').length

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <Badge tone="info">Milestone 2 corrected scope</Badge>
          <h2>Authentication plus vehicle and driver management.</h2>
          <p>
            TransportFlow AI now keeps the Milestone 1 UI foundation and adds only the
            required Milestone 2 scope: mock frontend authentication, protected routes,
            and local vehicle and driver management.
          </p>
        </div>
        <div className="hero-card">
          <p className="eyebrow">Current scope</p>
          <strong>Authentication, Vehicle & Driver Management</strong>
          <span>No backend, production auth provider, loads, dispatch, reports, settings, or AI.</span>
        </div>
      </section>

      <section className="stat-grid" aria-label="Milestone 2 summary">
        <StatCard label="Auth status" value="Protected" helper="Mock frontend login" tone="success" />
        <StatCard label="Vehicles" value={initialVehicles.length} helper={`${availableVehicles} available`} tone="info" />
        <StatCard label="Drivers" value={initialDrivers.length} helper={`${availableDrivers} available`} tone="info" />
        <StatCard label="Budget" value="$1,000" helper="Milestone 2 PRD amount" tone="neutral" />
      </section>

      <section className="content-grid">
        {milestoneAreas.map((area) => (
          <Card title={area.title} eyebrow="Included" key={area.title}>
            <p>{area.text}</p>
          </Card>
        ))}
      </section>

      <Card eyebrow="Primary module" title="Vehicle & Driver Management">
        <p>
          Open the corrected Milestone 2 module to manage local demo vehicle and driver records.
        </p>
        <Link className="button button-primary button-small" to="/vehicles-drivers">
          Open Vehicles & Drivers
        </Link>
      </Card>
    </div>
  )
}
