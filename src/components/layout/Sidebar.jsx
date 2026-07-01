import { NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Fleet', to: '/vehicles-drivers' },
  { label: 'Customers & Routes', to: '/customers-routes-trips' },
  { label: 'Fuel & Maintenance', to: '/fuel-maintenance' },
  { label: 'Invoices & Payments', to: '/invoices-payments' },
  { label: 'Reports', to: '/reports-analytics' },
  { label: 'Assistant', to: '/logistics-assistant' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand-block">
        <div className="brand-mark">TF</div>
        <div>
          <p className="brand-name">TransportFlow AI</p>
          <p className="brand-caption">Logistics ERP</p>
        </div>
      </div>

      <nav className="nav-stack">
        {navigation.map((item) => (
          <NavLink className="nav-link" to={item.to} key={item.to}>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="workspace-card">
        <span className="workspace-label">Workspace</span>
        <strong>Transport Operations</strong>
      </div>
    </aside>
  )
}
