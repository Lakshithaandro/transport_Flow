import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../components/ui/Card.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import useAuth from '../context/useAuth.js'
import { analyticsApi } from '../services/analyticsApi.js'
import { customerRouteTripApi } from '../services/customerRouteTripApi.js'
import { invoiceApi } from '../services/invoiceApi.js'
import { vehicleDriverApi } from '../services/vehicleDriverApi.js'
import { formatCurrencyINR } from '../utils/currency.js'

const activeTripStatuses = ['Scheduled', 'In Transit', 'Delayed']
const tripStatusLabels = {
  Scheduled: 'Scheduled',
  'In Transit': 'On Road',
  Delayed: 'Delayed',
  Completed: 'Completed',
}

function getRecordId(record) {
  return record?._id || record?.id
}

function toDateInputValue(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isToday(value) {
  if (!value) return false
  return toDateInputValue(value) === toDateInputValue(new Date())
}

function tripLabel(trip) {
  return trip?.id || `TRP-${String(getRecordId(trip) || '').slice(-6).toUpperCase()}`
}

function getSettledValue(results, index, fallback) {
  return results[index]?.status === 'fulfilled' ? results[index].value : fallback
}

function countTripsByStatus(trips, status) {
  return trips.filter((trip) => trip.status === status).length
}

export default function Dashboard() {
  const { getAuthToken } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    analytics: null,
    vehicles: [],
    drivers: [],
    trips: [],
    revenueSummary: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [warningMessage, setWarningMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadDashboard() {
      setIsLoading(true)
      setWarningMessage('')

      const results = await Promise.allSettled([
        analyticsApi.getReports(getAuthToken),
        vehicleDriverApi.getVehicles(getAuthToken),
        vehicleDriverApi.getDrivers(getAuthToken),
        customerRouteTripApi.getTrips(getAuthToken),
        invoiceApi.getRevenueSummary(getAuthToken),
      ])

      if (ignore) return

      setDashboardData({
        analytics: getSettledValue(results, 0, null),
        vehicles: getSettledValue(results, 1, []),
        drivers: getSettledValue(results, 2, []),
        trips: getSettledValue(results, 3, []),
        revenueSummary: getSettledValue(results, 4, null),
      })

      if (results.some((result) => result.status === 'rejected')) {
        setWarningMessage('Some dashboard data could not be loaded. Showing available details.')
      }

      setIsLoading(false)
    }

    loadDashboard()

    return () => {
      ignore = true
    }
  }, [getAuthToken])

  const { analytics, vehicles, drivers, trips, revenueSummary } = dashboardData
  const revenue = revenueSummary || analytics?.revenue || {}
  const fleet = analytics?.fleet || {}
  const driverSummary = analytics?.drivers || {}
  const operations = analytics?.operations || {}

  const totalVehicles = vehicles.length || fleet.totalVehicles || 0
  const activeTrips = trips.filter((trip) => activeTripStatuses.includes(trip.status)).length || operations.inTransitTrips || 0
  const totalDrivers = drivers.length || driverSummary.totalDrivers || 0
  const deliveriesToday = trips.filter((trip) => isToday(trip.scheduledDate)).length
  const maintenanceVehicles = vehicles.filter((vehicle) => vehicle.status === 'Maintenance').length || fleet.maintenanceVehicles || 0
  const driversNeedReview = drivers.filter((driver) => driver.status === 'Needs Review').length || driverSummary.needsReviewDrivers || 0

  const fallbackTripCounts = {
    Scheduled: operations.scheduledTrips || 0,
    'In Transit': operations.inTransitTrips || 0,
    Delayed: operations.delayedTrips || 0,
    Completed: operations.completedTrips || 0,
  }
  const tripsOverview = ['Scheduled', 'In Transit', 'Delayed', 'Completed'].map((status) => ({
    name: tripStatusLabels[status],
    trips: trips.length ? countTripsByStatus(trips, status) : Number(fallbackTripCounts[status]) || 0,
  }))

  const revenueOverview = [
    { name: 'Total Billing', amount: revenue.totalRevenue || 0 },
    { name: 'Collected', amount: revenue.paidRevenue || 0 },
    { name: 'Pending', amount: revenue.outstandingBalance || 0 },
  ]

  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.scheduledDate || 0).getTime() - new Date(a.scheduledDate || 0).getTime())
    .slice(0, 5)

  const activities = [
    maintenanceVehicles ? `${maintenanceVehicles} vehicles are in service or maintenance.` : '',
    deliveriesToday ? `${deliveriesToday} deliveries are planned for today.` : '',
    Number(revenue.outstandingBalance) ? `${formatCurrencyINR(revenue.outstandingBalance)} pending collection.` : '',
    driversNeedReview ? `${driversNeedReview} drivers need review before assignment.` : '',
  ].filter(Boolean)

  const recentTripColumns = [
    { key: 'trip', label: 'Trip', render: (trip) => <strong className="cell-primary">{tripLabel(trip)}</strong> },
    { key: 'customer', label: 'Party / Customer' },
    { key: 'route', label: 'Route' },
    { key: 'scheduledDate', label: 'Planned Date', render: (trip) => formatDate(trip.scheduledDate) },
    { key: 'status', label: 'Status', render: (trip) => <StatusBadge status={trip.status} /> },
  ]

  if (isLoading) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Business Dashboard" title="Today’s Transport Overview" description="Preparing your business dashboard." />
        <Card title="Loading dashboard"><p>Fetching trips, vehicles, drivers, and billing summary.</p></Card>
      </div>
    )
  }

  return (
    <div className="page-stack dashboard-page">
      <PageHeader
        eyebrow="Business Dashboard"
        title="Today’s Transport Overview"
        description="Quick view of trips, vehicles, drivers, and collections."
      />

      {warningMessage ? <p className="auth-error">{warningMessage}</p> : null}

      <section className="stat-grid" aria-label="Transport summary">
        <StatCard label="Total Vehicles" value={totalVehicles} helper="Fleet available in system" tone="info" />
        <StatCard label="Active Trips" value={activeTrips} helper="Scheduled, on road, or delayed" tone="success" />
        <StatCard label="Total Drivers" value={totalDrivers} helper={`${driversNeedReview} need review`} tone={driversNeedReview ? 'warning' : 'info'} />
        <StatCard label="Deliveries Today" value={deliveriesToday} helper="Planned for today" tone="neutral" />
      </section>

      <section className="stat-grid" aria-label="Billing and service summary">
        <StatCard label="Total Billing" value={formatCurrencyINR(revenue.totalRevenue)} helper="All invoice value" tone="info" />
        <StatCard label="Collected Amount" value={formatCurrencyINR(revenue.paidRevenue)} helper="Received payments" tone="success" />
        <StatCard label="Pending Amount" value={formatCurrencyINR(revenue.outstandingBalance)} helper="To be collected" tone="warning" />
        <StatCard label="Vehicles in Service" value={maintenanceVehicles} helper="Maintenance status" tone={maintenanceVehicles ? 'warning' : 'success'} />
      </section>

      <section className="dashboard-grid" aria-label="Dashboard charts">
        <Card className="chart-card" eyebrow="Trips Overview" title="Trip status">
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tripsOverview} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="trips" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="chart-card" eyebrow="Revenue Overview" title="Billing position">
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueOverview} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrencyINR(value)} />
                <Tooltip formatter={(value) => formatCurrencyINR(value)} />
                <Line type="monotone" dataKey="amount" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="content-grid" aria-label="Recent dashboard details">
        <Card className="table-shell compact-table" eyebrow="Recent Trips" title="Latest trip movement">
          <DataTable
            columns={recentTripColumns}
            rows={recentTrips}
            getRowKey={getRecordId}
            emptyTitle="No trips found yet"
            emptyMessage="Add trips to see recent movement here."
            enablePagination={false}
          />
        </Card>

        <Card eyebrow="Recent Activities" title="Important updates">
          {activities.length ? (
            <div className="activity-list">
              {activities.map((activity) => (
                <div className="activity-item" key={activity}>
                  <span className="activity-dot" aria-hidden="true" />
                  <span>{activity}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No important updates" message="Everything looks stable right now." />
          )}
        </Card>
      </section>
    </div>
  )
}
