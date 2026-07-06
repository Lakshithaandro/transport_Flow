import { useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import useAuth from '../context/useAuth.js'
import { analyticsApi } from '../services/analyticsApi.js'
import { formatCurrencyINR } from '../utils/currency.js'

function percent(value) {
  return `${Number(value) || 0}%`
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="section-heading compact-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
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
        <PageHeader eyebrow="Business Reports" title="Reports & Analytics" description="Preparing reports from your latest transport data." />
        <Card title="Loading reports"><p>Preparing billing, trips, vehicles, drivers, fuel, and service summaries.</p></Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Business Reports" title="Reports & Analytics" description="Simple summaries for your transport business." />
        <p className="auth-error">{error}</p>
      </div>
    )
  }

  if (!analytics) return null

  const revenue = analytics.revenue || {}
  const operations = analytics.operations || {}
  const fleet = analytics.fleet || {}
  const drivers = analytics.drivers || {}
  const fuel = analytics.fuel || {}
  const routeOptimization = analytics.routeOptimization || {}

  const routeColumns = [
    { key: 'routeName', label: 'Route' },
    { key: 'distanceMiles', label: 'Distance' },
    { key: 'estimatedHours', label: 'Hours' },
    { key: 'estimatedFuelCost', label: 'Fuel Estimate', render: (row) => formatCurrencyINR(row.estimatedFuelCost) },
  ]

  const fleetColumns = [
    { key: 'vehicleName', label: 'Vehicle' },
    { key: 'mileage', label: 'Mileage' },
    { key: 'status', label: 'Risk', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'recommendation', label: 'Suggested Action' },
  ]

  const driverColumns = [
    { key: 'driverName', label: 'Driver' },
    { key: 'assignedVehicle', label: 'Vehicle' },
    { key: 'trips', label: 'Trips' },
    { key: 'fuelSpend', label: 'Fuel Spend', render: (row) => formatCurrencyINR(row.fuelSpend) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ]

  const fuelVehicleColumns = [
    { key: 'vehicleName', label: 'Vehicle' },
    { key: 'fuelCost', label: 'Fuel Spend', render: (row) => formatCurrencyINR(row.fuelCost) },
  ]

  return (
    <div className="page-stack reports-page">
      <PageHeader
        eyebrow="Business Reports"
        title="Reports & Analytics"
        description="Simple summaries for billing, trips, vehicles, drivers, fuel, and service."
      />

      <section className="report-section" aria-labelledby="revenue-reports">
        <SectionHeading eyebrow="Revenue Reports" title="Billing and collections" description="Track billed, collected, and pending amounts." />
        <section className="stat-grid" aria-label="Revenue reports" id="revenue-reports">
          <StatCard label="Total Billing" value={formatCurrencyINR(revenue.totalRevenue)} helper="All invoice value" tone="info" />
          <StatCard label="Collected" value={formatCurrencyINR(revenue.paidRevenue)} helper={`${revenue.paidCount || 0} paid invoices`} tone="success" />
          <StatCard label="Pending Collection" value={formatCurrencyINR(revenue.outstandingBalance)} helper="Amount yet to receive" tone="warning" />
          <StatCard label="Collection Rate" value={percent(revenue.collectionRate)} helper="Collected vs billed" tone="neutral" />
        </section>
      </section>

      <section className="report-section" aria-labelledby="trip-reports">
        <SectionHeading eyebrow="Trip Reports" title="Trip performance" description="Review trip status and route-wise movement." />
        <section className="stat-grid" aria-label="Trip reports" id="trip-reports">
          <StatCard label="Total Trips" value={operations.tripCount || 0} helper="All recorded trips" tone="info" />
          <StatCard label="On Road" value={operations.inTransitTrips || 0} helper="Currently moving" tone="success" />
          <StatCard label="Delayed Trips" value={operations.delayedTrips || 0} helper="Need attention" tone={operations.delayedTrips ? 'warning' : 'success'} />
          <StatCard label="Delay Rate" value={percent(operations.delayRate)} helper="Delayed vs total trips" tone={operations.delayRate ? 'warning' : 'success'} />
        </section>
        <Card className="table-shell compact-table" eyebrow="Route Summary" title="Route-wise trip summary">
          <DataTable columns={routeColumns} rows={routeOptimization.scoredRoutes || []} getRowKey={(row) => row.id} emptyTitle="No route data" emptyMessage="Routes will appear here after trips are added." />
        </Card>
      </section>

      <section className="report-section" aria-labelledby="vehicle-utilization">
        <SectionHeading eyebrow="Vehicle Utilization" title="Vehicle usage" description="Understand vehicle availability and service risk." />
        <section className="stat-grid" aria-label="Vehicle utilization" id="vehicle-utilization">
          <StatCard label="Total Vehicles" value={fleet.totalVehicles || 0} helper="Fleet records" tone="info" />
          <StatCard label="Available" value={fleet.availableVehicles || 0} helper="Ready for dispatch" tone="success" />
          <StatCard label="In Maintenance" value={fleet.maintenanceVehicles || 0} helper="Under service" tone={fleet.maintenanceVehicles ? 'warning' : 'success'} />
          <StatCard label="Due for Service" value={fleet.vehiclesDueForService || 0} helper="Scheduled or overdue" tone={fleet.vehiclesDueForService ? 'warning' : 'neutral'} />
        </section>
        <Card className="table-shell compact-table" eyebrow="Vehicle Health" title="Service risk summary">
          <DataTable columns={fleetColumns} rows={fleet.healthPredictions || []} getRowKey={(row) => row.id} emptyTitle="No vehicle risk found" emptyMessage="Vehicle service details will appear here after maintenance records are added." />
        </Card>
      </section>

      <section className="report-section" aria-labelledby="driver-performance">
        <SectionHeading eyebrow="Driver Performance" title="Driver summary" description="Check driver trips, assigned vehicle, and review status." />
        <section className="stat-grid" aria-label="Driver performance" id="driver-performance">
          <StatCard label="Total Drivers" value={drivers.totalDrivers || 0} helper="Driver records" tone="info" />
          <StatCard label="Available" value={drivers.availableDrivers || 0} helper="Ready for trips" tone="success" />
          <StatCard label="Assigned" value={drivers.assignedDrivers || 0} helper="Already allocated" tone="neutral" />
          <StatCard label="Need Review" value={drivers.needsReviewDrivers || 0} helper="Check before dispatch" tone={drivers.needsReviewDrivers ? 'warning' : 'success'} />
        </section>
        <Card className="table-shell compact-table" eyebrow="Driver Summary" title="Driver work summary">
          <DataTable columns={driverColumns} rows={drivers.driverPerformance || []} getRowKey={(row) => row.id} emptyTitle="No driver data" emptyMessage="Driver performance will appear after trips and fuel logs are added." />
        </Card>
      </section>

      <section className="report-section" aria-labelledby="fuel-maintenance">
        <SectionHeading eyebrow="Fuel & Maintenance Summary" title="Spend and service" description="Track fuel spend and vehicle service cost in one place." />
        <section className="stat-grid" aria-label="Fuel and maintenance summary" id="fuel-maintenance">
          <StatCard label="Fuel Spend" value={formatCurrencyINR(fuel.totalFuelCost)} helper="Total fuel entries" tone="warning" />
          <StatCard label="Fuel Quantity" value={`${Number(fuel.totalGallons || 0).toLocaleString('en-IN')} gal`} helper="Fuel logged" tone="info" />
          <StatCard label="Average Fuel Rate" value={formatCurrencyINR(fuel.averageCostPerGallon)} helper="Average per gallon" tone="neutral" />
          <StatCard label="Service Cost" value={formatCurrencyINR(fleet.totalMaintenanceCost)} helper="Maintenance spend" tone="info" />
        </section>
        <Card className="table-shell compact-table" eyebrow="Fuel Spend" title="Fuel spend by vehicle">
          <DataTable columns={fuelVehicleColumns} rows={fuel.costByVehicle || []} getRowKey={(row) => row.id} emptyTitle="No fuel spend yet" emptyMessage="Fuel logs will appear here after they are created." />
        </Card>
      </section>
    </div>
  )
}
