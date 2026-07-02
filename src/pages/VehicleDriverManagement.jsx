import { useState } from 'react'
import Card from '../components/ui/Card.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import Field from '../components/ui/Field.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import Toolbar from '../components/ui/Toolbar.jsx'
import { initialDrivers, initialVehicles } from '../data/vehicleDriverData.js'
import {
  formatPhone,
  normalizePhone,
  normalizePlate,
  trimFormValues,
  validateBusinessText,
  validatePersonName,
  validatePhone,
  validatePlate,
} from '../utils/validation.js'

const statusOptions = ['All', 'Available', 'Assigned', 'Maintenance', 'Needs Review']
const vehicleTypeOptions = ['Tractor', 'Dry Van Trailer', 'Reefer Trailer', 'Flatbed Trailer']
const vehicleStatusOptions = ['Available', 'Assigned', 'Maintenance']
const driverLicenseOptions = ['Class A CDL', 'Class B CDL']
const driverStatusOptions = ['Available', 'Assigned', 'Needs Review']

function nextId(prefix, records) {
  const nextNumber = Math.max(0, ...records.map((record) => Number(String(record.id).replace(`${prefix}-`, '')) || 0)) + 1
  return `${prefix}-${String(nextNumber).padStart(3, '0')}`
}

export default function VehicleDriverManagement() {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [drivers, setDrivers] = useState(initialDrivers)
  const [vehicleQuery, setVehicleQuery] = useState('')
  const [driverQuery, setDriverQuery] = useState('')
  const [vehicleStatus, setVehicleStatus] = useState('All')
  const [driverStatus, setDriverStatus] = useState('All')
  const [vehicleError, setVehicleError] = useState('')
  const [driverError, setDriverError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [vehicleForm, setVehicleForm] = useState({ unit: '', type: 'Tractor', plate: '', status: 'Available' })
  const [driverForm, setDriverForm] = useState({ name: '', licenseClass: 'Class A CDL', phone: '', status: 'Available' })

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchableText = [vehicle.unit, vehicle.type, vehicle.plate, vehicle.assignedDriver].join(' ').toLowerCase()
    const matchesQuery = searchableText.includes(vehicleQuery.toLowerCase())
    const matchesStatus = vehicleStatus === 'All' || vehicle.status === vehicleStatus

    return matchesQuery && matchesStatus
  })

  const filteredDrivers = drivers.filter((driver) => {
    const searchableText = [driver.name, driver.licenseClass, driver.phone, driver.assignedVehicle].join(' ').toLowerCase()
    const matchesQuery = searchableText.includes(driverQuery.toLowerCase())
    const matchesStatus = driverStatus === 'All' || driver.status === driverStatus

    return matchesQuery && matchesStatus
  })

  const addVehicle = (event) => {
    event.preventDefault()
    setVehicleError('')

    const sanitizedForm = trimFormValues(vehicleForm)
    const normalizedPlate = normalizePlate(sanitizedForm.plate)
    const unitError = validateBusinessText(sanitizedForm.unit, 'Unit name', { min: 2, max: 40 })
    const plateError = validatePlate(sanitizedForm.plate)

    if (unitError || plateError) {
      setVehicleError(unitError || plateError)
      return
    }

    if (!vehicleTypeOptions.includes(sanitizedForm.type) || !vehicleStatusOptions.includes(sanitizedForm.status)) {
      setVehicleError('Choose a valid vehicle type and status.')
      return
    }

    const plateExists = vehicles.some((vehicle) => normalizePlate(vehicle.plate) === normalizedPlate)
    if (plateExists) {
      setVehicleError('A vehicle with that plate already exists.')
      return
    }

    setVehicles((currentVehicles) => [
      ...currentVehicles,
      {
        id: nextId('VEH', currentVehicles),
        ...sanitizedForm,
        plate: normalizedPlate,
        assignedDriver: 'Unassigned',
        mileage: 0,
      },
    ])
    setVehicleForm({ unit: '', type: 'Tractor', plate: '', status: 'Available' })
  }

  const addDriver = (event) => {
    event.preventDefault()
    setDriverError('')

    const sanitizedForm = trimFormValues(driverForm)
    const nameError = validatePersonName(sanitizedForm.name, 'Driver name')
    const phoneError = validatePhone(sanitizedForm.phone)

    if (nameError || phoneError) {
      setDriverError(nameError || phoneError)
      return
    }

    if (!driverLicenseOptions.includes(sanitizedForm.licenseClass) || !driverStatusOptions.includes(sanitizedForm.status)) {
      setDriverError('Choose a valid license class and driver status.')
      return
    }

    const phoneExists = drivers.some((driver) => normalizePhone(driver.phone) === normalizePhone(sanitizedForm.phone))
    if (phoneExists) {
      setDriverError('A driver with that phone number already exists.')
      return
    }

    setDrivers((currentDrivers) => [
      ...currentDrivers,
      {
        id: nextId('DRV', currentDrivers),
        ...sanitizedForm,
        phone: formatPhone(sanitizedForm.phone),
        assignedVehicle: 'Unassigned',
      },
    ])
    setDriverForm({ name: '', licenseClass: 'Class A CDL', phone: '', status: 'Available' })
  }

  const requestDelete = (type, record) => {
    setDeleteTarget({
      type,
      id: record.id,
      label: type === 'vehicle' ? record.unit : record.name,
    })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'vehicle') {
      setVehicles((currentVehicles) => currentVehicles.filter((vehicle) => vehicle.id !== deleteTarget.id))
    }

    if (deleteTarget.type === 'driver') {
      setDrivers((currentDrivers) => currentDrivers.filter((driver) => driver.id !== deleteTarget.id))
    }

    setDeleteTarget(null)
  }

  const vehicleColumns = [
    {
      key: 'unit',
      label: 'Vehicle',
      render: (vehicle) => <strong className="cell-primary">{vehicle.unit}</strong>,
    },
    { key: 'type', label: 'Type' },
    { key: 'plate', label: 'Plate' },
    {
      key: 'status',
      label: 'Status',
      render: (vehicle) => <StatusBadge status={vehicle.status} />,
    },
    { key: 'assignedDriver', label: 'Assigned driver' },
    {
      key: 'actions',
      label: 'Actions',
      className: 'cell-actions',
      render: (vehicle) => (
        <button className="button button-danger button-small" type="button" onClick={() => requestDelete('vehicle', vehicle)}>
          Remove
        </button>
      ),
    },
  ]

  const driverColumns = [
    {
      key: 'name',
      label: 'Driver',
      render: (driver) => <strong className="cell-primary">{driver.name}</strong>,
    },
    { key: 'licenseClass', label: 'License' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'status',
      label: 'Status',
      render: (driver) => <StatusBadge status={driver.status} />,
    },
    { key: 'assignedVehicle', label: 'Assigned vehicle' },
    {
      key: 'actions',
      label: 'Actions',
      className: 'cell-actions',
      render: (driver) => (
        <button className="button button-danger button-small" type="button" onClick={() => requestDelete('driver', driver)}>
          Remove
        </button>
      ),
    },
  ]

  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === 'Available').length
  const availableDrivers = drivers.filter((driver) => driver.status === 'Available').length
  const reviewDrivers = drivers.filter((driver) => driver.status === 'Needs Review').length

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Fleet Operations"
        title="Vehicles & Drivers"
        description="Manage fleet availability, driver readiness, and asset assignments."
      />

      <section className="stat-grid" aria-label="Vehicle and driver summary">
        <StatCard label="Vehicles" value={vehicles.length} helper="Fleet records" tone="info" />
        <StatCard label="Available vehicles" value={availableVehicles} helper="Ready for dispatch" tone="success" />
        <StatCard label="Drivers" value={drivers.length} helper="Driver records" tone="info" />
        <StatCard label="Drivers ready" value={availableDrivers} helper={`${reviewDrivers} need review`} tone="success" />
      </section>

      <section className="split-layout split-layout-wide">
        <Card className="table-shell" eyebrow="Vehicles" title="Vehicle records">
          <Toolbar>
            <Field label="Search vehicles">
              <input
                className="form-control"
                type="search"
                value={vehicleQuery}
                onChange={(event) => setVehicleQuery(event.target.value)}
                placeholder="Search unit, type, plate..."
              />
            </Field>
            <Field label="Status">
              <select className="form-control" value={vehicleStatus} onChange={(event) => setVehicleStatus(event.target.value)}>
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>
          </Toolbar>
          <DataTable columns={vehicleColumns} rows={filteredVehicles} getRowKey={(vehicle) => vehicle.id} />
        </Card>

        <Card eyebrow="Add vehicle" title="New vehicle record">
          <form className="form-grid form-grid-single" onSubmit={addVehicle} noValidate>
            <Field label="Unit name">
              <input
                className="form-control"
                value={vehicleForm.unit}
                onChange={(event) => setVehicleForm({ ...vehicleForm, unit: event.target.value })}
                placeholder="Tractor 130"
                maxLength="40"
                required
              />
            </Field>
            <Field label="Type">
              <select
                className="form-control"
                value={vehicleForm.type}
                onChange={(event) => setVehicleForm({ ...vehicleForm, type: event.target.value })}
                required
              >
                {vehicleTypeOptions.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </Field>
            <Field label="Plate">
              <input
                className="form-control"
                value={vehicleForm.plate}
                onChange={(event) => setVehicleForm({ ...vehicleForm, plate: event.target.value })}
                placeholder="TX-0000"
                maxLength="12"
                required
              />
            </Field>
            <Field label="Status">
              <select
                className="form-control"
                value={vehicleForm.status}
                onChange={(event) => setVehicleForm({ ...vehicleForm, status: event.target.value })}
                required
              >
                {vehicleStatusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>
            {vehicleError ? <p className="auth-error">{vehicleError}</p> : null}
            <button className="button button-primary" type="submit">
              Add vehicle
            </button>
          </form>
        </Card>
      </section>

      <section className="split-layout split-layout-wide">
        <Card className="table-shell" eyebrow="Drivers" title="Driver records">
          <Toolbar>
            <Field label="Search drivers">
              <input
                className="form-control"
                type="search"
                value={driverQuery}
                onChange={(event) => setDriverQuery(event.target.value)}
                placeholder="Search name, license, phone..."
              />
            </Field>
            <Field label="Status">
              <select className="form-control" value={driverStatus} onChange={(event) => setDriverStatus(event.target.value)}>
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>
          </Toolbar>
          <DataTable columns={driverColumns} rows={filteredDrivers} getRowKey={(driver) => driver.id} />
        </Card>

        <Card eyebrow="Add driver" title="New driver record">
          <form className="form-grid form-grid-single" onSubmit={addDriver} noValidate>
            <Field label="Driver name">
              <input
                className="form-control"
                value={driverForm.name}
                onChange={(event) => setDriverForm({ ...driverForm, name: event.target.value })}
                placeholder="Driver name"
                maxLength="80"
                required
              />
            </Field>
            <Field label="License class">
              <select
                className="form-control"
                value={driverForm.licenseClass}
                onChange={(event) => setDriverForm({ ...driverForm, licenseClass: event.target.value })}
                required
              >
                {driverLicenseOptions.map((licenseClass) => (
                  <option key={licenseClass}>{licenseClass}</option>
                ))}
              </select>
            </Field>
            <Field label="Phone">
              <input
                className="form-control"
                value={driverForm.phone}
                onChange={(event) => setDriverForm({ ...driverForm, phone: event.target.value })}
                placeholder="(555) 000-0000"
                inputMode="tel"
                autoComplete="tel"
                maxLength="18"
                required
              />
            </Field>
            <Field label="Status">
              <select
                className="form-control"
                value={driverForm.status}
                onChange={(event) => setDriverForm({ ...driverForm, status: event.target.value })}
                required
              >
                {driverStatusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </Field>
            {driverError ? <p className="auth-error">{driverError}</p> : null}
            <button className="button button-primary" type="submit">
              Add driver
            </button>
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
