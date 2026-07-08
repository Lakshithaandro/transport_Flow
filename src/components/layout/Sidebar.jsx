import { BarChart3, Bot, ClipboardList, Fuel, LayoutDashboard, MapPinned, Receipt, Settings, ShieldCheck, Truck, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useAuth from '../../context/useAuth.js'

const sharedNavigationSections = [
  {
    label: 'Daily Work',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Vehicles & Drivers', to: '/vehicles-drivers', icon: Truck },
      { label: 'Customers, Routes & Trips', to: '/customers-routes-trips', icon: MapPinned },
    ],
  },
  {
    label: 'Accounts & Reports',
    items: [
      { label: 'Fuel & Maintenance', to: '/fuel-maintenance', icon: Fuel },
      { label: 'Invoices', to: '/invoices-payments', icon: Receipt },
      { label: 'Reports', to: '/reports-analytics', icon: BarChart3 },
    ],
  },
]

const adminNavigationSections = [
  {
    label: 'Admin Tools',
    items: [
      { label: 'AI Assistant', to: '/logistics-assistant', icon: Bot },
      { label: 'Admin Dashboard', to: '/admin/dashboard', icon: ShieldCheck },
      { label: 'Manager Management', to: '/admin/users', icon: Users },
      { label: 'Activity Logs', to: '/admin/activity', icon: ClipboardList },
      { label: 'Shipments', to: '/admin/shipments', icon: Truck },
      { label: 'Settings', to: '/admin/settings', icon: Settings },
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
  const navigationSections = isAdmin ? [...sharedNavigationSections, ...adminNavigationSections] : sharedNavigationSections

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
      </nav>

      <div className="workspace-card">
        <span className="workspace-label">Workspace</span>
        <strong>Transport Operations</strong>
      </div>
    </aside>
  )
}
