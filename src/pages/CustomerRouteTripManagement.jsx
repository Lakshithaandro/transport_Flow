import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import Field from '../components/ui/Field.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import Toolbar from '../components/ui/Toolbar.jsx'
import useAuth from '../context/useAuth.js'
import { customerRouteTripApi } from '../services/customerRouteTripApi.js'
import { isBeforeToday, todayDateInputValue } from '../utils/date.js'
import {
  formatPhone,
  normalizePhone,
  parseBoundedNumber,
  trimFormValues,
  validateBusinessText,
  validateCompanyName,
  validateLocation,
  validateOptionalEmail,
  validatePersonName,
  validatePhone,
} from '../utils/validation.js'

const customerStatusOptions = ['All', 'Active', 'Inactive', 'Needs Review']
const routeStatusOptions = ['All', 'Active', 'Draft', 'Needs Review']
const tripStatusOptions = ['All', 'Scheduled', 'In Transit', 'Delayed', 'Completed']
const customerFormStatusOptions = ['Active', 'Inactive', 'Needs Review']
const routeFormStatusOptions = ['Active', 'Draft', 'Needs Review']
const tripFormStatusOptions = ['Scheduled', 'In Transit', 'Delayed', 'Completed']
const emptyCustomerForm = { company: '', contactName: '', phone: '', email: '', status: 'Active' }
const emptyRouteForm = { name: '', origin: '', destination: '', distanceMiles: '', estimatedHours: '', status: 'Draft' }
const emptyTripForm = { customer: '', route: '', vehicle: '', driver: '', scheduledDate: '', status: 'Scheduled' }

function getRecordId(record) {
  return record._id || record.id
}

function toDateInputValue(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

const MILES_TO_KILOMETERS = 1.60934
const MAX_ROUTE_DISTANCE_KILOMETERS = 16093

function milesToKilometers(value) {
  return Math.round((Number(value) || 0) * MILES_TO_KILOMETERS)
}

function kilometersToMiles(value) {
  return Math.round(((Number(value) || 0) / MILES_TO_KILOMETERS) * 100) / 100
}

function formatKilometers(value) {
  return `${milesToKilometers(value).toLocaleString()} km`
}

function tripLabel(trip) {
  return trip.id || `TRP-${String(getRecordId(trip)).slice(-6).toUpperCase()}`
}

export default function CustomerRouteTripManagement() {
  const { getAuthToken } = useAuth()
  const [customers, setCustomers] = useState([])
  const [routes, setRoutes] = useState([])
  const [trips, setTrips] = useState([])
  const [customerQuery, setCustomerQuery] = useState('')
  const [routeQuery, setRouteQuery] = useState('')
  const [tripQuery, setTripQuery] = useState('')
  const [customerStatus, setCustomerStatus] = useState('All')
  const [routeStatus, setRouteStatus] = useState('All')
  const [tripStatus, setTripStatus] = useState('All')
  const [customerError, setCustomerError] = useState('')
  const [routeError, setRouteError] = useState('')
  const [tripError, setTripError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCustomerSaving, setIsCustomerSaving] = useState(false)
  const [isRouteSaving, setIsRouteSaving] = useState(false)
  const [isTripSaving, setIsTripSaving] = useState(false)
  const [editingCustomerId, setEditingCustomerId] = useState(null)
  const [editingRouteId, setEditingRouteId] = useState(null)
  const [editingTripId, setEditingTripId] = useState(null)
  const today = todayDateInputValue()
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm)
  const [routeForm, setRouteForm] = useState(emptyRouteForm)
  const [tripForm, setTripForm] = useState(emptyTripForm)

  const loadNetworkRecords = async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const [customerData, routeData, tripData] = await Promise.all([
        customerRouteTripApi.getCustomers(getAuthToken),
        customerRouteTripApi.getRoutes(getAuthToken),
        customerRouteTripApi.getTrips(getAuthToken),
      ])
      setCustomers(customerData)
      setRoutes(routeData)
      setTrips(tripData)
    } catch (requestError) {
      setLoadError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNetworkRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    const searchableText = [trip.customer, trip.route, trip.vehicle, trip.driver, toDateInputValue(trip.scheduledDate), tripLabel(trip)].join(' ').toLowerCase()
    const matchesQuery = searchableText.includes(tripQuery.toLowerCase())
    const matchesStatus = tripStatus === 'All' || trip.status === tripStatus

    return matchesQuery && matchesStatus
  })

  const resetCustomerForm = () => {
    setEditingCustomerId(null)
    setCustomerForm(emptyCustomerForm)
    setCustomerError('')
  }

  const resetRouteForm = () => {
    setEditingRouteId(null)
    setRouteForm(emptyRouteForm)
    setRouteError('')
  }

  const resetTripForm = () => {
    setEditingTripId(null)
    setTripForm(emptyTripForm)
    setTripError('')
  }

  const submitCustomer = async (event) => {
    event.preventDefault()
    setCustomerError('')
    setSaveMessage('')

    const sanitizedForm = trimFormValues(customerForm)
    const companyError = validateCompanyName(sanitizedForm.company)
    const contactError = validatePersonName(sanitizedForm.contactName, 'Contact name')
    const phoneError = validatePhone(sanitizedForm.phone)
    const emailError = validateOptionalEmail(sanitizedForm.email)

    if (companyError || contactError || phoneError || emailError) {
      setCustomerError(companyError || contactError || phoneError || emailError)
      return
    }

    if (!customerFormStatusOptions.includes(sanitizedForm.status)) {
      setCustomerError('Choose a valid customer status.')
      return
    }

    const phoneExists = customers.some(
      (customer) => getRecordId(customer) !== editingCustomerId && normalizePhone(customer.phone) === normalizePhone(sanitizedForm.phone),
    )
    if (phoneExists) {
      setCustomerError('A customer with that phone number already exists.')
      return
    }

    const payload = { ...sanitizedForm, phone: formatPhone(sanitizedForm.phone), email: sanitizedForm.email.toLowerCase() }
    setIsCustomerSaving(true)

    try {
      if (editingCustomerId) {
        const updatedCustomer = await customerRouteTripApi.updateCustomer(editingCustomerId, payload, getAuthToken)
        setCustomers((currentCustomers) =>
          currentCustomers.map((customer) => (getRecordId(customer) === editingCustomerId ? updatedCustomer : customer)),
        )
        setSaveMessage('Customer updated successfully.')
      } else {
        const createdCustomer = await customerRouteTripApi.createCustomer(payload, getAuthToken)
        setCustomers((currentCustomers) => [...currentCustomers, createdCustomer])
        setSaveMessage('Customer created successfully.')
      }
      resetCustomerForm()
    } catch (requestError) {
      setCustomerError(requestError.message)
    } finally {
      setIsCustomerSaving(false)
    }
  }

  const submitRoute = async (event) => {
    event.preventDefault()
    setRouteError('')
    setSaveMessage('')

    const sanitizedForm = trimFormValues(routeForm)
    const nameError = validateBusinessText(sanitizedForm.name, 'Route name', { min: 3, max: 100 })
    const originError = validateLocation(sanitizedForm.origin, 'Origin')
    const destinationError = validateLocation(sanitizedForm.destination, 'Destination')
    const distance = parseBoundedNumber(sanitizedForm.distanceMiles, 'Distance (km)', { min: 1, max: MAX_ROUTE_DISTANCE_KILOMETERS })
    const hours = parseBoundedNumber(sanitizedForm.estimatedHours, 'Estimated hours', { min: 0.25, max: 240 })

    if (nameError || originError || destinationError || distance.error || hours.error) {
      setRouteError(nameError || originError || destinationError || (distance.error ? 'Distance must be entered in kilometers.' : '') || hours.error)
      return
    }

    if (sanitizedForm.origin.toLowerCase() === sanitizedForm.destination.toLowerCase()) {
      setRouteError('Origin and destination must be different.')
      return
    }

    if (!routeFormStatusOptions.includes(sanitizedForm.status)) {
      setRouteError('Choose a valid route status.')
      return
    }

    const payload = { ...sanitizedForm, distanceMiles: kilometersToMiles(distance.value), estimatedHours: hours.value }
    setIsRouteSaving(true)

    try {
      if (editingRouteId) {
        const updatedRoute = await customerRouteTripApi.updateRoute(editingRouteId, payload, getAuthToken)
        setRoutes((currentRoutes) => currentRoutes.map((route) => (getRecordId(route) === editingRouteId ? updatedRoute : route)))
        setSaveMessage('Route updated successfully.')
      } else {
        const createdRoute = await customerRouteTripApi.createRoute(payload, getAuthToken)
        setRoutes((currentRoutes) => [...currentRoutes, createdRoute])
        setSaveMessage('Route created successfully.')
      }
      resetRouteForm()
    } catch (requestError) {
      setRouteError(requestError.message)
    } finally {
      setIsRouteSaving(false)
    }
  }

  const submitTrip = async (event) => {
    event.preventDefault()
    setTripError('')
    setSaveMessage('')

    const sanitizedForm = trimFormValues(tripForm)
    const customerErrorMessage = validateCompanyName(sanitizedForm.customer, 'Customer')
    const routeErrorMessage = validateBusinessText(sanitizedForm.route, 'Route', { min: 3, max: 100 })
    const vehicleErrorMessage = validateBusinessText(sanitizedForm.vehicle, 'Vehicle', { min: 2, max: 40 })
    const driverErrorMessage = validatePersonName(sanitizedForm.driver, 'Driver')

    if (customerErrorMessage || routeErrorMessage || vehicleErrorMessage || driverErrorMessage) {
      setTripError(customerErrorMessage || routeErrorMessage || vehicleErrorMessage || driverErrorMessage)
      return
    }

    if (!sanitizedForm.scheduledDate) {
      setTripError('Scheduled date is required.')
      return
    }

    if (isBeforeToday(sanitizedForm.scheduledDate)) {
      setTripError('Scheduled date cannot be in the past.')
      return
    }

    if (!tripFormStatusOptions.includes(sanitizedForm.status)) {
      setTripError('Choose a valid trip status.')
      return
    }

    setIsTripSaving(true)

    try {
      if (editingTripId) {
        const updatedTrip = await customerRouteTripApi.updateTrip(editingTripId, sanitizedForm, getAuthToken)
        setTrips((currentTrips) => currentTrips.map((trip) => (getRecordId(trip) === editingTripId ? updatedTrip : trip)))
        setSaveMessage('Trip updated successfully.')
      } else {
        const createdTrip = await customerRouteTripApi.createTrip(sanitizedForm, getAuthToken)
        setTrips((currentTrips) => [...currentTrips, createdTrip])
        setSaveMessage('Trip created successfully.')
      }
      resetTripForm()
    } catch (requestError) {
      setTripError(requestError.message)
    } finally {
      setIsTripSaving(false)
    }
  }

  const editCustomer = (customer) => {
    setEditingCustomerId(getRecordId(customer))
    setCustomerError('')
    setSaveMessage('')
    setCustomerForm({
      company: customer.company,
      contactName: customer.contactName,
      phone: customer.phone,
      email: customer.email || '',
      status: customer.status,
    })
  }

  const editRoute = (route) => {
    setEditingRouteId(getRecordId(route))
    setRouteError('')
    setSaveMessage('')
    setRouteForm({
      name: route.name,
      origin: route.origin,
      destination: route.destination,
      distanceMiles: milesToKilometers(route.distanceMiles),
      estimatedHours: route.estimatedHours,
      status: route.status,
    })
  }

  const editTrip = (trip) => {
    setEditingTripId(getRecordId(trip))
    setTripError('')
    setSaveMessage('')
    setTripForm({
      customer: trip.customer,
      route: trip.route,
      vehicle: trip.vehicle,
      driver: trip.driver,
      scheduledDate: toDateInputValue(trip.scheduledDate),
      status: trip.status,
    })
  }

  const requestDelete = (type, record) => {
    const labels = {
      customer: record.company,
      route: record.name,
      trip: tripLabel(record),
    }

    setDeleteTarget({ type, id: getRecordId(record), label: labels[type] })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    setLoadError('')
    setSaveMessage('')

    try {
      if (deleteTarget.type === 'customer') {
        await customerRouteTripApi.deleteCustomer(deleteTarget.id, getAuthToken)
        setCustomers((currentCustomers) => currentCustomers.filter((customer) => getRecordId(customer) !== deleteTarget.id))
        if (editingCustomerId === deleteTarget.id) resetCustomerForm()
        setSaveMessage('Customer deleted successfully.')
      }

      if (deleteTarget.type === 'route') {
        await customerRouteTripApi.deleteRoute(deleteTarget.id, getAuthToken)
        setRoutes((currentRoutes) => currentRoutes.filter((route) => getRecordId(route) !== deleteTarget.id))
        if (editingRouteId === deleteTarget.id) resetRouteForm()
        setSaveMessage('Route deleted successfully.')
      }

      if (deleteTarget.type === 'trip') {
        await customerRouteTripApi.deleteTrip(deleteTarget.id, getAuthToken)
        setTrips((currentTrips) => currentTrips.filter((trip) => getRecordId(trip) !== deleteTarget.id))
        if (editingTripId === deleteTarget.id) resetTripForm()
        setSaveMessage('Trip deleted successfully.')
      }

      setDeleteTarget(null)
    } catch (requestError) {
      setLoadError(requestError.message)
    }
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
    {
      key: 'actions',
      label: 'Actions',
      className: 'cell-actions',
      render: (customer) => (
        <div className="inline-group">
          <button className="button button-secondary button-small" type="button" onClick={() => editCustomer(customer)}>
            <Pencil className="lucide-icon" aria-hidden="true" />
            Edit
          </button>
          <button className="button button-danger button-small" type="button" onClick={() => requestDelete('customer', customer)}>
            Remove
          </button>
        </div>
      ),
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
      label: 'Distance (km)',
      render: (route) => formatKilometers(route.distanceMiles),
    },
    {
      key: 'status',
      label: 'Status',
      render: (route) => <StatusBadge status={route.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'cell-actions',
      render: (route) => (
        <div className="inline-group">
          <button className="button button-secondary button-small" type="button" onClick={() => editRoute(route)}>
            <Pencil className="lucide-icon" aria-hidden="true" />
            Edit
          </button>
          <button className="button button-danger button-small" type="button" onClick={() => requestDelete('route', route)}>
            Remove
          </button>
        </div>
      ),
    },
  ]

  const tripColumns = [
    {
      key: 'id',
      label: 'Trip',
      render: (trip) => <strong className="cell-primary">{tripLabel(trip)}</strong>,
    },
    { key: 'customer', label: 'Customer' },
    { key: 'route', label: 'Route' },
    { key: 'scheduledDate', label: 'Scheduled', render: (trip) => toDateInputValue(trip.scheduledDate) },
    {
      key: 'status',
      label: 'Status',
      render: (trip) => <StatusBadge status={trip.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'cell-actions',
      render: (trip) => (
        <div className="inline-group">
          <button className="button button-secondary button-small" type="button" onClick={() => editTrip(trip)}>
            <Pencil className="lucide-icon" aria-hidden="true" />
            Edit
          </button>
          <button className="button button-danger button-small" type="button" onClick={() => requestDelete('trip', trip)}>
            Remove
          </button>
        </div>
      ),
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

      {loadError ? <p className="auth-error">{loadError}</p> : null}
      {saveMessage ? <p className="save-message">{saveMessage}</p> : null}
      {isLoading ? <Card title="Loading network records"><p>Fetching customers, routes, and trips from the backend API.</p></Card> : null}

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
          <DataTable columns={customerColumns} rows={filteredCustomers} getRowKey={getRecordId} />
        </Card>

        <Card eyebrow={editingCustomerId ? 'Edit customer' : 'Add customer'} title={editingCustomerId ? 'Update customer record' : 'New customer record'}>
          <form className="form-grid form-grid-single" onSubmit={submitCustomer} noValidate>
            <Field label="Company">
              <input
                className="form-control"
                value={customerForm.company}
                onChange={(event) => setCustomerForm({ ...customerForm, company: event.target.value })}
                placeholder="Customer company"
                maxLength="100"
                required
              />
            </Field>
            <Field label="Contact name">
              <input
                className="form-control"
                value={customerForm.contactName}
                onChange={(event) => setCustomerForm({ ...customerForm, contactName: event.target.value })}
                placeholder="Primary contact"
                maxLength="80"
                required
              />
            </Field>
            <Field label="Phone">
              <input
                className="form-control"
                value={customerForm.phone}
                onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })}
                placeholder="(555) 000-0000"
                inputMode="tel"
                autoComplete="tel"
                maxLength="18"
                required
              />
            </Field>
            <Field label="Email">
              <input
                className="form-control"
                type="email"
                value={customerForm.email}
                onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })}
                placeholder="ops@example.com"
                maxLength="120"
              />
            </Field>
            <Field label="Status">
              <select
                className="form-control"
                value={customerForm.status}
                onChange={(event) => setCustomerForm({ ...customerForm, status: event.target.value })}
                required
              >
                {customerFormStatusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>
            {customerError ? <p className="auth-error">{customerError}</p> : null}
            <div className="inline-group">
              <button className="button button-primary" type="submit" disabled={isCustomerSaving}>
                {isCustomerSaving ? 'Saving...' : editingCustomerId ? 'Update customer' : 'Add customer'}
              </button>
              {editingCustomerId ? <button className="button button-secondary" type="button" onClick={resetCustomerForm} disabled={isCustomerSaving}>Cancel edit</button> : null}
            </div>
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
          <DataTable columns={routeColumns} rows={filteredRoutes} getRowKey={getRecordId} />
        </Card>

        <Card eyebrow={editingRouteId ? 'Edit route' : 'Add route'} title={editingRouteId ? 'Update route record' : 'New route record'}>
          <form className="form-grid form-grid-single" onSubmit={submitRoute} noValidate>
            <Field label="Route name">
              <input
                className="form-control"
                value={routeForm.name}
                onChange={(event) => setRouteForm({ ...routeForm, name: event.target.value })}
                placeholder="Dallas to Atlanta"
                maxLength="100"
                required
              />
            </Field>
            <Field label="Origin">
              <input
                className="form-control"
                value={routeForm.origin}
                onChange={(event) => setRouteForm({ ...routeForm, origin: event.target.value })}
                placeholder="Origin city/state"
                maxLength="80"
                required
              />
            </Field>
            <Field label="Destination">
              <input
                className="form-control"
                value={routeForm.destination}
                onChange={(event) => setRouteForm({ ...routeForm, destination: event.target.value })}
                placeholder="Destination city/state"
                maxLength="80"
                required
              />
            </Field>
            <Field label="Distance (km)">
              <input
                className="form-control"
                type="number"
                min="1"
                max={MAX_ROUTE_DISTANCE_KILOMETERS}
                step="1"
                inputMode="numeric"
                value={routeForm.distanceMiles}
                onChange={(event) => setRouteForm({ ...routeForm, distanceMiles: event.target.value })}
                placeholder="500 km"
                required
              />
            </Field>
            <Field label="Estimated hours">
              <input
                className="form-control"
                type="number"
                min="0.25"
                max="240"
                step="0.25"
                inputMode="decimal"
                value={routeForm.estimatedHours}
                onChange={(event) => setRouteForm({ ...routeForm, estimatedHours: event.target.value })}
                placeholder="8.5"
                required
              />
            </Field>
            <Field label="Status">
              <select
                className="form-control"
                value={routeForm.status}
                onChange={(event) => setRouteForm({ ...routeForm, status: event.target.value })}
                required
              >
                {routeFormStatusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>
            {routeError ? <p className="auth-error">{routeError}</p> : null}
            <div className="inline-group">
              <button className="button button-primary" type="submit" disabled={isRouteSaving}>
                {isRouteSaving ? 'Saving...' : editingRouteId ? 'Update route' : 'Add route'}
              </button>
              {editingRouteId ? <button className="button button-secondary" type="button" onClick={resetRouteForm} disabled={isRouteSaving}>Cancel edit</button> : null}
            </div>
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
          <DataTable columns={tripColumns} rows={filteredTrips} getRowKey={getRecordId} />
        </Card>

        <Card eyebrow={editingTripId ? 'Edit trip' : 'Add trip'} title={editingTripId ? 'Update trip record' : 'New trip record'}>
          <form className="form-grid form-grid-single" onSubmit={submitTrip} noValidate>
            <Field label="Customer">
              <input
                className="form-control"
                value={tripForm.customer}
                onChange={(event) => setTripForm({ ...tripForm, customer: event.target.value })}
                placeholder="Customer company"
                maxLength="100"
                required
              />
            </Field>
            <Field label="Route">
              <input
                className="form-control"
                value={tripForm.route}
                onChange={(event) => setTripForm({ ...tripForm, route: event.target.value })}
                placeholder="Route name"
                maxLength="100"
                required
              />
            </Field>
            <Field label="Vehicle">
              <input
                className="form-control"
                value={tripForm.vehicle}
                onChange={(event) => setTripForm({ ...tripForm, vehicle: event.target.value })}
                placeholder="Vehicle unit"
                maxLength="40"
                required
              />
            </Field>
            <Field label="Driver">
              <input
                className="form-control"
                value={tripForm.driver}
                onChange={(event) => setTripForm({ ...tripForm, driver: event.target.value })}
                placeholder="Driver name"
                maxLength="80"
                required
              />
            </Field>
            <Field label="Scheduled date">
              <input
                className="form-control"
                type="date"
                min={today}
                value={tripForm.scheduledDate}
                onChange={(event) => setTripForm({ ...tripForm, scheduledDate: event.target.value })}
                required
              />
            </Field>
            <Field label="Status">
              <select
                className="form-control"
                value={tripForm.status}
                onChange={(event) => setTripForm({ ...tripForm, status: event.target.value })}
                required
              >
                {tripFormStatusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>
            {tripError ? <p className="auth-error">{tripError}</p> : null}
            <div className="inline-group">
              <button className="button button-primary" type="submit" disabled={isTripSaving}>
                {isTripSaving ? 'Saving...' : editingTripId ? 'Update trip' : 'Add trip'}
              </button>
              {editingTripId ? <button className="button button-secondary" type="button" onClick={resetTripForm} disabled={isTripSaving}>Cancel edit</button> : null}
            </div>
          </form>
        </Card>
      </section>

      {deleteTarget ? (
        <ConfirmModal
          title={`Remove ${deleteTarget.type}?`}
          message={`Are you sure you want to remove "${deleteTarget.label}"? This action cannot be undone.`}
          confirmLabel="Remove"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  )
}
