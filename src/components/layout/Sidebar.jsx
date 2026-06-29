import { NavLink } from 'react-router-dom'
import Badge from '../ui/Badge.jsx'

const navigation = [
  { label: 'Overview', to: '/', end: true },
  { label: 'Vehicles & Drivers', to: '/vehicles-drivers' },
  { label: 'Customers, Routes & Trips', to: '/customers-routes-trips' },
  { label: 'Design System', to: '/design-system' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand-block">
        <div className="brand-mark">TF</div>
        <div>
          <p className="brand-name">TransportFlow AI</p>
          <p className="brand-caption">Milestone 3 workspace</p>
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
        <Badge tone="info">Milestone 3</Badge>
        <p>Authentication, vehicles, drivers, customers, routes, and trips.</p>
      </div>
    </aside>
  )
}
