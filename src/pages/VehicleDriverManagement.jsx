import { useState } from 'react'
import Card from '../components/ui/Card.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import Field from '../components/ui/Field.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import Toolbar from '../components/ui/Toolbar.jsx'
import { initialDrivers, initialVehicles } from '../data/vehicleDriverData.js'

const statusOptions = ['All', 'Available', 'Assigned', 'Maintenance', 'Needs Review']

function nextId(prefix, records) {
  return `${prefix}-${String(records.length + 1).padStart(3, '0')}`
}

export default function VehicleDriverManagement() {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [drivers, setDrivers] = useState(initialDrivers)
  const [vehicleQuery, setVehicleQuery] = useState('')
  const [driverQuery, setDriverQuery] = useState('')
  const [vehicleStatus, setVehicleStatus] = useState('All')
  const [driverStatus, setDriverStatus] = useState('All')
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

    if (!vehicleForm.unit || !vehicleForm.plate) return

    setVehicles((currentVehicles) => [
      ...currentVehicles,
      {
        id: nextId('VEH', currentVehicles),
        ...vehicleForm,
        assignedDriver: 'Unassigned',
        mileage: 0,
      },
    ])
    setVehicleForm({ unit: '', type: 'Tractor', plate: '', status: 'Available' })
  }

  const addDriver = (event) => {
    event.preventDefault()

    if (!driverForm.name || !driverForm.phone) return

    setDrivers((currentDrivers) => [
      ...currentDrivers,
      {
        id: nextId('DRV', currentDrivers),
        ...driverForm,
        assignedVehicle: 'Unassigned',
      },
    ])
    setDriverForm({ name: '', licenseClass: 'Class A CDL', phone: '', status: 'Available' })
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
  ]

  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === 'Available').length
  const availableDrivers = drivers.filter((driver) => driver.status === 'Available').length
  const reviewDrivers = drivers.filter((driver) => driver.status === 'Needs Review').length

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Milestone 2"
        title="Vehicle & Driver Management"
        description="Manage demo vehicles and drivers with local frontend state. Authentication protects this workspace."
      />

      <section className="stat-grid" aria-label="Vehicle and driver summary">
        <StatCard label="Vehicles" value={vehicles.length} helper="Mock vehicle records" tone="info" />
        <StatCard label="Available vehicles" value={availableVehicles} helper="Ready for use" tone="success" />
        <StatCard label="Drivers" value={drivers.length} helper="Mock driver records" tone="info" />
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
          <form className="form-grid form-grid-single" onSubmit={addVehicle}>
            <Field label="Unit name">
              <input
                className="form-control"
                value={vehicleForm.unit}
                onChange={(event) => setVehicleForm({ ...vehicleForm, unit: event.target.value })}
                placeholder="Tractor 130"
              />
            </Field>
            <Field label="Type">
              <select
                className="form-control"
                value={vehicleForm.type}
                onChange={(event) => setVehicleForm({ ...vehicleForm, type: event.target.value })}
              >
                <option>Tractor</option>
                <option>Dry Van Trailer</option>
                <option>Reefer Trailer</option>
                <option>Flatbed Trailer</option>
              </select>
            </Field>
            <Field label="Plate">
              <input
                className="form-control"
                value={vehicleForm.plate}
                onChange={(event) => setVehicleForm({ ...vehicleForm, plate: event.target.value })}
                placeholder="TX-0000"
              />
            </Field>
            <Field label="Status">
              <select
                className="form-control"
                value={vehicleForm.status}
                onChange={(event) => setVehicleForm({ ...vehicleForm, status: event.target.value })}
              >
                <option>Available</option>
                <option>Assigned</option>
                <option>Maintenance</option>
              </select>
            </Field>
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
          <form className="form-grid form-grid-single" onSubmit={addDriver}>
            <Field label="Driver name">
              <input
                className="form-control"
                value={driverForm.name}
                onChange={(event) => setDriverForm({ ...driverForm, name: event.target.value })}
                placeholder="Driver name"
              />
            </Field>
            <Field label="License class">
              <select
                className="form-control"
                value={driverForm.licenseClass}
                onChange={(event) => setDriverForm({ ...driverForm, licenseClass: event.target.value })}
              >
                <option>Class A CDL</option>
                <option>Class B CDL</option>
              </select>
            </Field>
            <Field label="Phone">
              <input
                className="form-control"
                value={driverForm.phone}
                onChange={(event) => setDriverForm({ ...driverForm, phone: event.target.value })}
                placeholder="(555) 000-0000"
              />
            </Field>
            <Field label="Status">
              <select
                className="form-control"
                value={driverForm.status}
                onChange={(event) => setDriverForm({ ...driverForm, status: event.target.value })}
              >
                <option>Available</option>
                <option>Assigned</option>
                <option>Needs Review</option>
              </select>
            </Field>
            <button className="button button-primary" type="submit">
              Add driver
            </button>
          </form>
        </Card>
      </section>
    </div>
  )
}
