import { useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import useAuth from '../context/useAuth.js'
import { analyticsApi } from '../services/analyticsApi.js'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

function currency(value) {
  return currencyFormatter.format(Number(value) || 0)
}

function percent(value) {
  return `${Number(value) || 0}%`
}

export default function ReportsAnalytics() {
  const { getAuthToken } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await analyticsApi.getReports(getAuthToken)
        setAnalytics(data)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [getAuthToken])

  if (isLoading) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Performance" title="Reports" description="Loading revenue, fleet, driver, fuel, operational, and financial KPIs." />
        <Card title="Loading analytics"><p>Preparing operational reports.</p></Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Performance" title="Reports" description="Revenue, fleet, driver, fuel, operational, and financial KPIs." />
        <p className="auth-error">{error}</p>
      </div>
    )
  }

  if (!analytics) return null

  const fuelVehicleColumns = [
    { key: 'vehicleName', label: 'Vehicle' },
    { key: 'fuelCost', label: 'Fuel Cost', render: (row) => currency(row.fuelCost) },
  ]

  const driverColumns = [
    { key: 'driverName', label: 'Driver' },
    { key: 'assignedVehicle', label: 'Vehicle' },
    { key: 'trips', label: 'Trips' },
    { key: 'fuelSpend', label: 'Fuel Spend', render: (row) => currency(row.fuelSpend) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ]

  const routeColumns = [
    { key: 'routeName', label: 'Route' },
    { key: 'distanceMiles', label: 'Miles' },
    { key: 'estimatedHours', label: 'Hours' },
    { key: 'estimatedFuelCost', label: 'Est. Fuel', render: (row) => currency(row.estimatedFuelCost) },
  ]

  const fleetColumns = [
    { key: 'vehicleName', label: 'Vehicle' },
    { key: 'mileage', label: 'Mileage' },
    { key: 'status', label: 'Risk', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'recommendation', label: 'Recommendation' },
  ]

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Performance"
        title="Reports"
        description="Monitor revenue, fleet, driver, fuel, operational, and financial KPIs."
      />

      <section className="stat-grid" aria-label="Revenue analytics">
        <StatCard label="Total Revenue" value={currency(analytics.revenue.totalRevenue)} helper="All invoice totals" tone="info" />
        <StatCard label="Paid Revenue" value={currency(analytics.revenue.paidRevenue)} helper={`${analytics.revenue.paidCount} paid invoices`} tone="success" />
        <StatCard label="Outstanding" value={currency(analytics.revenue.outstandingBalance)} helper="Pending and partial balances" tone="warning" />
        <StatCard label="Collection Rate" value={percent(analytics.revenue.collectionRate)} helper="Paid revenue vs total" tone="neutral" />
      </section>

      <section className="stat-grid" aria-label="Fleet and operational analytics">
        <StatCard label="Fleet" value={analytics.fleet.totalVehicles} helper={`${analytics.fleet.availableVehicles} available · ${analytics.fleet.maintenanceVehicles} maintenance`} tone="info" />
        <StatCard label="Drivers" value={analytics.drivers.totalDrivers} helper={`${analytics.drivers.needsReviewDrivers} need review`} tone="warning" />
        <StatCard label="Trips" value={analytics.operations.tripCount} helper={`${analytics.operations.delayedTrips} delayed · ${analytics.operations.inTransitTrips} in transit`} tone="success" />
        <StatCard label="Delay Rate" value={percent(analytics.operations.delayRate)} helper="Trip schedule KPI" tone={analytics.operations.delayRate ? 'warning' : 'success'} />
      </section>

      <section className="stat-grid" aria-label="Fuel and financial analytics">
        <StatCard label="Fuel Cost" value={currency(analytics.fuel.totalFuelCost)} helper={`${analytics.fuel.totalGallons} gallons logged`} tone="warning" />
        <StatCard label="Avg. Fuel Price" value={currency(analytics.fuel.averageCostPerGallon)} helper="Average cost per gallon" tone="neutral" />
        <StatCard label="Maintenance Cost" value={currency(analytics.fleet.totalMaintenanceCost)} helper={`${analytics.fleet.vehiclesDueForService} vehicles due`} tone="info" />
        <StatCard label="Est. Gross Margin" value={currency(analytics.financial.estimatedGrossMargin)} helper={`${analytics.financial.estimatedGrossMarginRate}% estimated margin`} tone={analytics.financial.estimatedGrossMargin >= 0 ? 'success' : 'danger'} />
      </section>

      <section className="content-grid">
        <Card className="table-shell" eyebrow="Fuel analytics" title="Fuel cost by vehicle">
          <DataTable columns={fuelVehicleColumns} rows={analytics.fuel.costByVehicle} getRowKey={(row) => row.id} emptyTitle="No fuel costs yet" emptyMessage="Fuel logs will appear here after they are created." />
        </Card>

        <Card className="table-shell" eyebrow="Driver analytics" title="Driver performance summary">
          <DataTable columns={driverColumns} rows={analytics.drivers.driverPerformance} getRowKey={(row) => row.id} />
        </Card>
      </section>

      <section className="content-grid">
        <Card className="table-shell" eyebrow="Operational KPIs" title="Route utilization and fuel estimate">
          <DataTable columns={routeColumns} rows={analytics.routeOptimization.scoredRoutes} getRowKey={(row) => row.id} />
        </Card>

        <Card className="table-shell" eyebrow="Fleet analytics" title="Fleet health prediction">
          <DataTable columns={fleetColumns} rows={analytics.fleet.healthPredictions} getRowKey={(row) => row.id} />
        </Card>
      </section>

      <Card eyebrow="Data notes" title="Report assumptions">
        <div className="panel-list">
          {analytics.dataNotes.map((note) => (
            <div className="panel-list-item" key={note}>
              <strong>{note}</strong>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
