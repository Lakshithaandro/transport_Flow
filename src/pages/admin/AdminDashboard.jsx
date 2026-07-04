import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import useAuth from '../../context/useAuth.js'
import { adminApi } from '../../services/adminApi.js'

const chartColors = ['#1f5eff', '#0f9f6e', '#b7791f', '#dc2626']
const defaultDashboard = {
  stats: {},
  shipmentStatusChart: [],
  monthlyShipmentTrends: [],
  recentActivities: [],
  recentShipments: [],
  quickActions: [],
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function AdminDashboard() {
  const { getAuthToken } = useAuth()
  const [dashboard, setDashboard] = useState(defaultDashboard)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadDashboard() {
      setIsLoading(true)
      setError('')

      try {
        const data = await adminApi.getDashboard(getAuthToken)
        if (!ignore) setDashboard({ ...defaultDashboard, ...data })
      } catch (requestError) {
        if (!ignore) setError(requestError.message)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadDashboard()

    return () => {
      ignore = true
    }
  }, [getAuthToken])

  const stats = dashboard.stats || {}
  const activityColumns = [
    { key: 'createdAt', label: 'Timestamp', render: (activity) => formatDate(activity.createdAt) },
    { key: 'action', label: 'Action', render: (activity) => <strong className="cell-primary">{activity.action}</strong> },
    { key: 'adminName', label: 'Admin', render: (activity) => activity.adminName || activity.adminEmail || 'Admin' },
    { key: 'targetType', label: 'Target' },
  ]
  const shipmentColumns = [
    { key: 'shipmentNumber', label: 'Shipment', render: (shipment) => <strong className="cell-primary">{shipment.shipmentNumber}</strong> },
    { key: 'customerName', label: 'Customer' },
    { key: 'lane', label: 'Lane', render: (shipment) => `${shipment.origin} → ${shipment.destination}` },
    { key: 'status', label: 'Status', render: (shipment) => <StatusBadge status={shipment.status} /> },
  ]

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Admin" title="Admin Dashboard" description="Monitor platform users, shipment movement, and recent admin activity." />

      {error ? <p className="auth-error">{error}</p> : null}
      {isLoading ? <Card title="Loading dashboard"><p>Loading admin analytics and activity.</p></Card> : null}

      <section className="stat-grid" aria-label="Admin statistics">
        <StatCard label="Total Users" value={stats.totalUsers || 0} helper="Active platform accounts" tone="info" />
        <StatCard label="Total Shipments" value={stats.totalShipments || 0} helper="All shipment records" tone="neutral" />
        <StatCard label="Active Shipments" value={stats.activeShipments || 0} helper="Currently in transit" tone="warning" />
        <StatCard label="Delivered" value={stats.deliveredShipments || 0} helper="Completed shipments" tone="success" />
        <StatCard label="Pending" value={stats.pendingShipments || 0} helper="Awaiting movement" tone="warning" />
        <StatCard label="Drivers" value={stats.totalDrivers || 0} helper={`${stats.totalVehicles || 0} vehicles tracked`} tone="info" />
      </section>

      <section className="content-grid">
        <Card eyebrow="Shipments" title="Shipment status chart">
          {dashboard.shipmentStatusChart.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={dashboard.shipmentStatusChart} dataKey="count" nameKey="status" outerRadius={90} label>
                  {dashboard.shipmentStatusChart.map((entry, index) => <Cell key={entry.status} fill={chartColors[index % chartColors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No shipment status data" message="Shipment status analytics will appear after shipments are created." />}
        </Card>

        <Card eyebrow="Trends" title="Monthly shipment trends">
          {dashboard.monthlyShipmentTrends.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dashboard.monthlyShipmentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1f5eff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No shipment trend data" message="Monthly trends will appear as shipment records are added." />}
        </Card>

        <Card eyebrow="Activity" title="Recent activities">
          <DataTable columns={activityColumns} rows={dashboard.recentActivities} getRowKey={(activity) => activity._id || activity.id} emptyTitle="No admin activity yet" enablePagination={false} />
        </Card>

        <Card eyebrow="Quick actions" title="Admin shortcuts">
          <div className="panel-list">
            {dashboard.quickActions.map((action) => (
              <Link className="panel-list-item" key={action.to} to={action.to}>
                <strong>{action.label}</strong>
                <span>Open {action.label.toLowerCase()}</span>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      <Card className="table-shell" eyebrow="Shipments" title="Recent shipments">
        <DataTable columns={shipmentColumns} rows={dashboard.recentShipments} getRowKey={(shipment) => shipment._id || shipment.id} emptyTitle="No recent shipments" enablePagination={false} />
      </Card>

      <Card eyebrow="Forecast" title="Shipment volume line preview">
        {dashboard.monthlyShipmentTrends.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dashboard.monthlyShipmentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0f9f6e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyState title="No monthly line data" message="A shipment trend line will appear when shipment history exists." />}
      </Card>
    </div>
  )
}
