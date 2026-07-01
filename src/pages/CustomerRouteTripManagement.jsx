import { useState } from 'react'
import Card from '../components/ui/Card.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import Field from '../components/ui/Field.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import Toolbar from '../components/ui/Toolbar.jsx'
import { initialCustomers, initialRoutes, initialTrips } from '../data/customerRouteTripData.js'
import { isBeforeToday, todayDateInputValue } from '../utils/date.js'

const customerStatusOptions = ['All', 'Active', 'Inactive', 'Needs Review']
const routeStatusOptions = ['All', 'Active', 'Draft', 'Needs Review']
const tripStatusOptions = ['All', 'Scheduled', 'In Transit', 'Delayed', 'Completed']

function nextId(prefix, records) {
  return `${prefix}-${String(records.length + 1).padStart(3, '0')}`
}

export default function CustomerRouteTripManagement() {
  const [customers, setCustomers] = useState(initialCustomers)
  const [routes, setRoutes] = useState(initialRoutes)
  const [trips, setTrips] = useState(initialTrips)
  const [customerQuery, setCustomerQuery] = useState('')
  const [routeQuery, setRouteQuery] = useState('')
  const [tripQuery, setTripQuery] = useState('')
  const [customerStatus, setCustomerStatus] = useState('All')
  const [routeStatus, setRouteStatus] = useState('All')
  const [tripStatus, setTripStatus] = useState('All')
  const [tripError, setTripError] = useState('')
  const today = todayDateInputValue()
  const [customerForm, setCustomerForm] = useState({
    company: '',
    contactName: '',
    phone: '',
    email: '',
    status: 'Active',
  })
  const [routeForm, setRouteForm] = useState({
    name: '',
    origin: '',
    destination: '',
    distanceMiles: '',
    estimatedHours: '',
    status: 'Draft',
  })
  const [tripForm, setTripForm] = useState({
    customer: '',
    route: '',
    vehicle: '',
    driver: '',
    scheduledDate: '',
    status: 'Scheduled',
  })

  const filteredCustomers = customers.filter((customer) => {
    const searchableText = [customer.company, customer.contactName, customer.phone, customer.email].join(' ').toLowerCase()
    const matchesQuery = searchableText.includes(customerQuery.toLowerCase())
    const matchesStatus = customerStatus === 'All' || customer.status === customerStatus

    return matchesQuery && matchesStatus
  })

  const filteredRoutes = routes.filter((route) => {
    const searchableText = [route.name, route.origin, route.destination].join(' ').toLowerCase()
    const matchesQuery = searchableText.includes(routeQuery.toLowerCase())
    const matchesStatus = routeStatus === 'All' || route.status === routeStatus

    return matchesQuery && matchesStatus
  })

  const filteredTrips = trips.filter((trip) => {
    const searchableText = [trip.customer, trip.route, trip.vehicle, trip.driver, trip.scheduledDate].join(' ').toLowerCase()
    const matchesQuery = searchableText.includes(tripQuery.toLowerCase())
    const matchesStatus = tripStatus === 'All' || trip.status === tripStatus

    return matchesQuery && matchesStatus
  })

  const addCustomer = (event) => {
    event.preventDefault()

    if (!customerForm.company || !customerForm.contactName || !customerForm.phone) return

    setCustomers((currentCustomers) => [
      ...currentCustomers,
      {
        id: nextId('CUS', currentCustomers),
        ...customerForm,
      },
    ])
    setCustomerForm({ company: '', contactName: '', phone: '', email: '', status: 'Active' })
  }

  const addRoute = (event) => {
    event.preventDefault()

    if (!routeForm.name || !routeForm.origin || !routeForm.destination) return

    setRoutes((currentRoutes) => [
      ...currentRoutes,
      {
        id: nextId('RTE', currentRoutes),
        ...routeForm,
        distanceMiles: Number(routeForm.distanceMiles) || 0,
        estimatedHours: Number(routeForm.estimatedHours) || 0,
      },
    ])
    setRouteForm({ name: '', origin: '', destination: '', distanceMiles: '', estimatedHours: '', status: 'Draft' })
  }

  const addTrip = (event) => {
    event.preventDefault()
    setTripError('')

    if (!tripForm.customer || !tripForm.route || !tripForm.scheduledDate) return

    if (isBeforeToday(tripForm.scheduledDate)) {
      setTripError('Scheduled date cannot be in the past.')
      return
    }

    setTrips((currentTrips) => [
      ...currentTrips,
      {
        id: nextId('TRP', currentTrips),
        ...tripForm,
      },
    ])
    setTripForm({ customer: '', route: '', vehicle: '', driver: '', scheduledDate: '', status: 'Scheduled' })
  }

  const customerColumns = [
    {
      key: 'company',
      label: 'Company',
      render: (customer) => <strong className="cell-primary">{customer.company}</strong>,
    },
    { key: 'contactName', label: 'Contact' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      render: (customer) => <StatusBadge status={customer.status} />,
    },
  ]

  const routeColumns = [
    {
      key: 'name',
      label: 'Route',
      render: (route) => <strong className="cell-primary">{route.name}</strong>,
    },
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    {
      key: 'distanceMiles',
      label: 'Miles',
      render: (route) => Number(route.distanceMiles).toLocaleString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (route) => <StatusBadge status={route.status} />,
    },
  ]

  const tripColumns = [
    {
      key: 'id',
      label: 'Trip',
      render: (trip) => <strong className="cell-primary">{trip.id}</strong>,
    },
    { key: 'customer', label: 'Customer' },
    { key: 'route', label: 'Route' },
    { key: 'scheduledDate', label: 'Scheduled' },
    {
      key: 'status',
      label: 'Status',
      render: (trip) => <StatusBadge status={trip.status} />,
    },
  ]

  const activeCustomers = customers.filter((customer) => customer.status === 'Active').length
  const activeRoutes = routes.filter((route) => route.status === 'Active').length
  const scheduledTrips = trips.filter((trip) => trip.status === 'Scheduled').length

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Network Planning"
        title="Customers, Routes & Trips"
        description="Manage customer accounts, route definitions, and scheduled trips."
      />

      <section className="stat-grid" aria-label="Customer route trip summary">
        <StatCard label="Customers" value={customers.length} helper={`${activeCustomers} active`} tone="info" />
        <StatCard label="Routes" value={routes.length} helper={`${activeRoutes} active`} tone="success" />
        <StatCard label="Trips" value={trips.length} helper={`${scheduledTrips} scheduled`} tone="info" />
        <StatCard label="Planning" value="Live" helper="Operational workspace" tone="neutral" />
      </section>

      <section className="split-layout split-layout-wide">
        <Card className="table-shell" eyebrow="Customers" title="Customer records">
          <Toolbar>
            <Field label="Search customers">
              <input
                className="form-control"
                type="search"
                value={customerQuery}
                onChange={(event) => setCustomerQuery(event.target.value)}
                placeholder="Search company, contact, phone..."
              />
            </Field>
            <Field label="Status">
              <select className="form-control" value={customerStatus} onChange={(event) => setCustomerStatus(event.target.value)}>
                {customerStatusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>
          </Toolbar>
          <DataTable columns={customerColumns} rows={filteredCustomers} getRowKey={(customer) => customer.id} />
        </Card>

        <Card eyebrow="Add customer" title="New customer record">
          <form className="form-grid form-grid-single" onSubmit={addCustomer}>
            <Field label="Company">
              <input
                className="form-control"
                value={customerForm.company}
                onChange={(event) => setCustomerForm({ ...customerForm, company: event.target.value })}
                placeholder="Customer company"
              />
            </Field>
            <Field label="Contact name">
              <input
                className="form-control"
                value={customerForm.contactName}
                onChange={(event) => setCustomerForm({ ...customerForm, contactName: event.target.value })}
                placeholder="Primary contact"
              />
            </Field>
            <Field label="Phone">
              <input
                className="form-control"
                value={customerForm.phone}
                onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })}
                placeholder="(555) 000-0000"
              />
            </Field>
            <Field label="Email">
              <input
                className="form-control"
                value={customerForm.email}
                onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })}
                placeholder="ops@example.com"
              />
            </Field>
            <Field label="Status">
              <select
                className="form-control"
                value={customerForm.status}
                onChange={(event) => setCustomerForm({ ...customerForm, status: event.target.value })}
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Needs Review</option>
              </select>
            </Field>
            <button className="button button-primary" type="submit">
              Add customer
            </button>
          </form>
        </Card>
      </section>

      <section className="split-layout split-layout-wide">
        <Card className="table-shell" eyebrow="Routes" title="Route records">
          <Toolbar>
            <Field label="Search routes">
              <input
                className="form-control"
                type="search"
                value={routeQuery}
                onChange={(event) => setRouteQuery(event.target.value)}
                placeholder="Search route, origin, destination..."
              />
            </Field>
            <Field label="Status">
              <select className="form-control" value={routeStatus} onChange={(event) => setRouteStatus(event.target.value)}>
                {routeStatusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>
          </Toolbar>
          <DataTable columns={routeColumns} rows={filteredRoutes} getRowKey={(route) => route.id} />
        </Card>

        <Card eyebrow="Add route" title="New route record">
          <form className="form-grid form-grid-single" onSubmit={addRoute}>
            <Field label="Route name">
              <input
                className="form-control"
                value={routeForm.name}
                onChange={(event) => setRouteForm({ ...routeForm, name: event.target.value })}
                placeholder="Dallas to Atlanta"
              />
            </Field>
            <Field label="Origin">
              <input
                className="form-control"
                value={routeForm.origin}
                onChange={(event) => setRouteForm({ ...routeForm, origin: event.target.value })}
                placeholder="Origin city/state"
              />
            </Field>
            <Field label="Destination">
              <input
                className="form-control"
                value={routeForm.destination}
                onChange={(event) => setRouteForm({ ...routeForm, destination: event.target.value })}
                placeholder="Destination city/state"
              />
            </Field>
            <Field label="Distance miles">
              <input
                className="form-control"
                type="number"
                value={routeForm.distanceMiles}
                onChange={(event) => setRouteForm({ ...routeForm, distanceMiles: event.target.value })}
                placeholder="500"
              />
            </Field>
            <Field label="Estimated hours">
              <input
                className="form-control"
                type="number"
                step="0.5"
                value={routeForm.estimatedHours}
                onChange={(event) => setRouteForm({ ...routeForm, estimatedHours: event.target.value })}
                placeholder="8.5"
              />
            </Field>
            <Field label="Status">
              <select
                className="form-control"
                value={routeForm.status}
                onChange={(event) => setRouteForm({ ...routeForm, status: event.target.value })}
              >
                <option>Active</option>
                <option>Draft</option>
                <option>Needs Review</option>
              </select>
            </Field>
            <button className="button button-primary" type="submit">
              Add route
            </button>
          </form>
        </Card>
      </section>

      <section className="split-layout split-layout-wide">
        <Card className="table-shell" eyebrow="Trips" title="Trip records">
          <Toolbar>
            <Field label="Search trips">
              <input
                className="form-control"
                type="search"
                value={tripQuery}
                onChange={(event) => setTripQuery(event.target.value)}
                placeholder="Search customer, route, driver..."
              />
            </Field>
            <Field label="Status">
              <select className="form-control" value={tripStatus} onChange={(event) => setTripStatus(event.target.value)}>
                {tripStatusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>
          </Toolbar>
          <DataTable columns={tripColumns} rows={filteredTrips} getRowKey={(trip) => trip.id} />
        </Card>

        <Card eyebrow="Add trip" title="New trip record">
          <form className="form-grid form-grid-single" onSubmit={addTrip}>
            <Field label="Customer">
              <input
                className="form-control"
                value={tripForm.customer}
                onChange={(event) => setTripForm({ ...tripForm, customer: event.target.value })}
                placeholder="Customer company"
              />
            </Field>
            <Field label="Route">
              <input
                className="form-control"
                value={tripForm.route}
                onChange={(event) => setTripForm({ ...tripForm, route: event.target.value })}
                placeholder="Route name"
              />
            </Field>
            <Field label="Vehicle">
              <input
                className="form-control"
                value={tripForm.vehicle}
                onChange={(event) => setTripForm({ ...tripForm, vehicle: event.target.value })}
                placeholder="Vehicle unit"
              />
            </Field>
            <Field label="Driver">
              <input
                className="form-control"
                value={tripForm.driver}
                onChange={(event) => setTripForm({ ...tripForm, driver: event.target.value })}
                placeholder="Driver name"
              />
            </Field>
            <Field label="Scheduled date">
              <input
                className="form-control"
                type="date"
                min={today}
                value={tripForm.scheduledDate}
                onChange={(event) => setTripForm({ ...tripForm, scheduledDate: event.target.value })}
              />
            </Field>
            {tripError ? <p className="auth-error">{tripError}</p> : null}
            <Field label="Status">
              <select
                className="form-control"
                value={tripForm.status}
                onChange={(event) => setTripForm({ ...tripForm, status: event.target.value })}
              >
                <option>Scheduled</option>
                <option>In Transit</option>
                <option>Delayed</option>
                <option>Completed</option>
              </select>
            </Field>
            <button className="button button-primary" type="submit">
              Add trip
            </button>
          </form>
        </Card>
      </section>
    </div>
  )
}
