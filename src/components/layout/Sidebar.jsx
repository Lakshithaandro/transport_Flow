import { NavLink } from 'react-router-dom'
import Badge from '../ui/Badge.jsx'

const navigation = [
  { label: 'Overview', to: '/', end: true },
  { label: 'Vehicles & Drivers', to: '/vehicles-drivers' },
  { label: 'Customers, Routes & Trips', to: '/customers-routes-trips' },
  { label: 'Fuel & Maintenance', to: '/fuel-maintenance' },
  { label: 'Invoices & Payments', to: '/invoices-payments' },
  { label: 'Design System', to: '/design-system' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand-block">
        <div className="brand-mark">TF</div>
        <div>
          <p className="brand-name">TransportFlow AI</p>
          <p className="brand-caption">Milestone 5 workspace</p>
        </div>
      </div>

      <nav className="nav-stack">
        {navigation.map((item) => (
          <NavLink className="nav-link" to={item.to} end={item.end} key={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-note">
        <Badge tone="info">Milestone 5</Badge>
        <p>Invoice and payment management now uses protected backend APIs.</p>
      </div>
    </aside>
  )
}
