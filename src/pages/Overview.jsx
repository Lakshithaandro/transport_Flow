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
    title: 'Firebase authentication',
    text: 'Protected frontend routes now use Firebase Auth, and Milestone 4 APIs verify Firebase ID tokens.',
  },
  {
    title: 'Vehicle and driver management',
    text: 'Vehicle and driver records remain available from the earlier milestone module.',
  },
  {
    title: 'Customer, route and trip management',
    text: 'Customer, route, and trip management remains available as the Milestone 3 module.',
  },
  {
    title: 'Fuel and maintenance management',
    text: 'Fuel logs and maintenance records are managed through protected REST APIs backed by MongoDB Atlas.',
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
          <Badge tone="info">Milestone 4 fullstack scope</Badge>
          <h2>Fuel and maintenance management with protected backend APIs.</h2>
          <p>
            TransportFlow AI now adds a fullstack Milestone 4 module for fuel logs and
            maintenance records using Firebase Auth, REST APIs, Zod validation, and MongoDB Atlas.
          </p>
        </div>
        <div className="hero-card">
          <p className="eyebrow">Current scope</p>
          <strong>Fuel & Maintenance Management</strong>
          <span>No invoices, reports, AI, or unrelated workflow modules were added.</span>
        </div>
      </section>

      <section className="stat-grid" aria-label="Milestone summary">
        <StatCard label="Auth" value="Firebase" helper="Protected frontend and APIs" tone="success" />
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
          <p>Open the Milestone 2 module to manage local demo vehicle and driver records.</p>
          <Link className="button button-primary button-small" to="/vehicles-drivers">
            Open Vehicles & Drivers
          </Link>
        </Card>

        <Card eyebrow="Milestone 3 module" title="Customer, Route & Trip Management">
          <p>Open the Milestone 3 module to manage local demo customer, route, and trip records.</p>
          <Link className="button button-primary button-small" to="/customers-routes-trips">
            Open Customers, Routes & Trips
          </Link>
        </Card>

        <Card eyebrow="Milestone 4 module" title="Fuel & Maintenance Management">
          <p>Open the fullstack Milestone 4 module backed by Firebase Auth, REST APIs, and MongoDB Atlas.</p>
          <Link className="button button-primary button-small" to="/fuel-maintenance">
            Open Fuel & Maintenance
          </Link>
        </Card>
      </section>
    </div>
  )
}
