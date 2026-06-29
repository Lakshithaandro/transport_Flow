import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import { initialCustomers, initialRoutes, initialTrips } from '../data/customerRouteTripData.js'
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
  {
    title: 'Customer management',
    text: 'Customer records can be searched, filtered, and added locally for Milestone 3.',
  },
  {
    title: 'Route and trip management',
    text: 'Route and trip records use the same local-state pattern without backend integration.',
  },
]

export default function Overview() {
  const availableVehicles = initialVehicles.filter((vehicle) => vehicle.status === 'Available').length
  const availableDrivers = initialDrivers.filter((driver) => driver.status === 'Available').length
  const milestone3Records = initialCustomers.length + initialRoutes.length + initialTrips.length

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <Badge tone="info">Milestone 3 scope</Badge>
          <h2>Authentication, vehicles, drivers, customers, routes, and trips.</h2>
          <p>
            TransportFlow AI keeps the Milestone 1 foundation and Milestone 2 authentication,
            vehicle, and driver management while adding Milestone 3 customer, route, and trip
            management with mock frontend data.
          </p>
        </div>
        <div className="hero-card">
          <p className="eyebrow">Current scope</p>
          <strong>Customer, Route & Trip Management</strong>
          <span>No backend, production auth provider, dispatch workflow, reports, settings, or AI.</span>
        </div>
      </section>

      <section className="stat-grid" aria-label="Milestone summary">
        <StatCard label="Auth status" value="Protected" helper="Mock frontend login" tone="success" />
        <StatCard label="Vehicles" value={initialVehicles.length} helper={`${availableVehicles} available`} tone="info" />
        <StatCard label="Drivers" value={initialDrivers.length} helper={`${availableDrivers} available`} tone="info" />
        <StatCard label="Milestone 3" value={milestone3Records} helper="Customer, route, trip records" tone="success" />
      </section>

      <section className="content-grid">
        {milestoneAreas.map((area) => (
          <Card title={area.title} eyebrow="Included" key={area.title}>
            <p>{area.text}</p>
          </Card>
        ))}
      </section>

      <section className="content-grid">
        <Card eyebrow="Milestone 2 module" title="Vehicle & Driver Management">
          <p>
            Open the corrected Milestone 2 module to manage local demo vehicle and driver records.
          </p>
          <Link className="button button-primary button-small" to="/vehicles-drivers">
            Open Vehicles & Drivers
          </Link>
        </Card>

        <Card eyebrow="Milestone 3 module" title="Customer, Route & Trip Management">
          <p>
            Open the Milestone 3 module to manage local demo customer, route, and trip records.
          </p>
          <Link className="button button-primary button-small" to="/customers-routes-trips">
            Open Customers, Routes & Trips
          </Link>
        </Card>
      </section>
    </div>
  )
}
