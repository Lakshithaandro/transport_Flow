import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-workspace">
        <Topbar />
        <main className="page-container">{children}</main>
      </div>
    </div>
  )
}
