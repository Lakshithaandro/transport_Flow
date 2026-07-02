import { BarChart3, Bot, Fuel, LayoutDashboard, MapPinned, Receipt, ShieldCheck, Truck } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useAuth from '../../context/useAuth.js'

const navigationSections = [
  {
    label: 'Daily Work',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Fleet & Drivers', to: '/vehicles-drivers', icon: Truck },
      { label: 'Customers & Trips', to: '/customers-routes-trips', icon: MapPinned },
    ],
  },
  {
    label: 'Accounts & Reports',
    items: [
      { label: 'Fuel & Service', to: '/fuel-maintenance', icon: Fuel },
      { label: 'Invoices & Payments', to: '/invoices-payments', icon: Receipt },
      { label: 'Reports', to: '/reports-analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { label: 'AI Assistant', to: '/logistics-assistant', icon: Bot },
    ],
  },
]

function NavItem({ item }) {
  const Icon = item.icon

  return (
    <NavLink className="nav-link" to={item.to} key={item.to}>
      <Icon className="lucide-icon nav-link-icon" aria-hidden="true" />
      <span className="nav-link-label">{item.label}</span>
    </NavLink>
  )
}

export default function Sidebar() {
  const { isAdmin } = useAuth()

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
        {navigationSections.map((section) => (
          <div className="nav-section" key={section.label}>
            <p className="nav-section-title">{section.label}</p>
            {section.items.map((item) => <NavItem item={item} key={item.to} />)}
          </div>
        ))}

        {isAdmin ? (
          <div className="nav-section">
            <p className="nav-section-title">Admin</p>
            <NavItem item={{ label: 'Admin Panel', to: '/admin/dashboard', icon: ShieldCheck }} />
          </div>
        ) : null}
      </nav>

      <div className="workspace-card">
        <span className="workspace-label">Workspace</span>
        <strong>Transport Operations</strong>
      </div>
    </aside>
  )
}
