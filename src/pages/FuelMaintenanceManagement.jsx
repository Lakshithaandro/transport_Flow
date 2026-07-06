import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import Field from '../components/ui/Field.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import Toolbar from '../components/ui/Toolbar.jsx'
import useAuth from '../context/useAuth.js'
import { fuelMaintenanceApi } from '../services/fuelMaintenanceApi.js'
import { vehicleDriverApi } from '../services/vehicleDriverApi.js'
import { formatCurrencyINR } from '../utils/currency.js'
import { isAfterDate, isBeforeToday, todayDateInputValue } from '../utils/date.js'

const emptyFuelForm = {
  vehicleId: '',
  vehicleName: '',
  driverId: '',
  driverName: '',
  fuelQuantity: '',
  fuelCost: '',
  fuelStation: '',
  odometerReading: '',
  date: '',
  notes: '',
}

const emptyMaintenanceForm = {
  vehicleId: '',
  vehicleName: '',
  serviceType: '',
  nextServiceDate: '',
  cost: '',
  mechanicName: '',
  status: 'Scheduled',
  reminderDate: '',
  notes: '',
}

const maintenanceStatuses = ['Scheduled', 'In Progress', 'Completed', 'Overdue']

function toDateInputValue(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

function getRecordId(record) {
  return record._id || record.id
}

export default function FuelMaintenanceManagement() {
  const { getAuthToken } = useAuth()
  const [fuelLogs, setFuelLogs] = useState([])
  const [maintenanceRecords, setMaintenanceRecords] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [summary, setSummary] = useState({
    totalFuelCost: 0,
    averageMileage: 0,
    vehiclesDueForService: 0,
    totalMaintenanceCost: 0,
  })
  const [fuelForm, setFuelForm] = useState(emptyFuelForm)
  const [maintenanceForm, setMaintenanceForm] = useState(emptyMaintenanceForm)
  const [editingFuelId, setEditingFuelId] = useState(null)
  const [editingMaintenanceId, setEditingMaintenanceId] = useState(null)
  const [fuelQuery, setFuelQuery] = useState('')
  const [maintenanceQuery, setMaintenanceQuery] = useState('')
  const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [isFuelSaving, setIsFuelSaving] = useState(false)
  const [isMaintenanceSaving, setIsMaintenanceSaving] = useState(false)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const today = todayDateInputValue()

  const loadFuelMaintenanceData = async () => {
    setIsLoading(true)
    setError('')

    try {
      const [fuelData, maintenanceData, summaryData, vehicleData, driverData] = await Promise.all([
        fuelMaintenanceApi.getFuelLogs(getAuthToken),
        fuelMaintenanceApi.getMaintenanceRecords(getAuthToken),
        fuelMaintenanceApi.getSummary(getAuthToken),
        vehicleDriverApi.getVehicles(getAuthToken),
        vehicleDriverApi.getDrivers(getAuthToken),
      ])
      setFuelLogs(fuelData)
      setMaintenanceRecords(maintenanceData)
      setSummary(summaryData)
      setVehicles(vehicleData)
      setDrivers(driverData)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFuelMaintenanceData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleVehicleSelection = (vehicleId, setter, currentForm) => {
    const vehicle = vehicles.find((item) => getRecordId(item) === vehicleId)
    setter({ ...currentForm, vehicleId, vehicleName: vehicle?.unit || '' })
  }

  const handleDriverSelection = (driverId) => {
    const driver = drivers.find((item) => getRecordId(item) === driverId)
    setFuelForm({ ...fuelForm, driverId, driverName: driver?.name || '' })
  }

  const submitFuelLog = async (event) => {
    event.preventDefault()
    setError('')
    setSaveMessage('')

    if (isBeforeToday(fuelForm.date)) {
      setError('Fuel log date cannot be in the past.')
      return
    }

    const payload = {
      ...fuelForm,
      fuelQuantity: Number(fuelForm.fuelQuantity),
      fuelCost: Number(fuelForm.fuelCost),
      odometerReading: Number(fuelForm.odometerReading),
    }

    setIsFuelSaving(true)

    try {
      if (editingFuelId) {
        const updatedFuelLog = await fuelMaintenanceApi.updateFuelLog(editingFuelId, payload, getAuthToken)
        setFuelLogs((currentLogs) => currentLogs.map((log) => (getRecordId(log) === editingFuelId ? updatedFuelLog : log)))
        setSaveMessage('Fuel log updated successfully.')
      } else {
        const createdFuelLog = await fuelMaintenanceApi.createFuelLog(payload, getAuthToken)
        setFuelLogs((currentLogs) => [createdFuelLog, ...currentLogs])
        setSaveMessage('Fuel log created successfully.')
      }
      setFuelForm(emptyFuelForm)
      setEditingFuelId(null)
      setSummary(await fuelMaintenanceApi.getSummary(getAuthToken))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsFuelSaving(false)
    }
  }

  const submitMaintenanceRecord = async (event) => {
    event.preventDefault()
    setError('')
    setSaveMessage('')

    if (isBeforeToday(maintenanceForm.nextServiceDate)) {
      setError('Next service date cannot be in the past.')
      return
    }

    if (isBeforeToday(maintenanceForm.reminderDate)) {
      setError('Reminder date cannot be in the past.')
      return
    }

    if (isAfterDate(maintenanceForm.reminderDate, maintenanceForm.nextServiceDate)) {
      setError('Reminder date cannot be after the next service date.')
      return
    }

    const payload = {
      ...maintenanceForm,
      cost: Number(maintenanceForm.cost),
    }

    setIsMaintenanceSaving(true)

    try {
      if (editingMaintenanceId) {
        const updatedRecord = await fuelMaintenanceApi.updateMaintenanceRecord(editingMaintenanceId, payload, getAuthToken)
        setMaintenanceRecords((currentRecords) =>
          currentRecords.map((record) => (getRecordId(record) === editingMaintenanceId ? updatedRecord : record)),
        )
        setSaveMessage('Maintenance record updated successfully.')
      } else {
        const createdRecord = await fuelMaintenanceApi.createMaintenanceRecord(payload, getAuthToken)
        setMaintenanceRecords((currentRecords) => [createdRecord, ...currentRecords])
        setSaveMessage('Maintenance record created successfully.')
      }
      setMaintenanceForm(emptyMaintenanceForm)
      setEditingMaintenanceId(null)
      setSummary(await fuelMaintenanceApi.getSummary(getAuthToken))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsMaintenanceSaving(false)
    }
  }

  const editFuelLog = (fuelLog) => {
    setEditingFuelId(getRecordId(fuelLog))
    setFuelForm({
      vehicleId: fuelLog.vehicleId,
      vehicleName: fuelLog.vehicleName,
      driverId: fuelLog.driverId,
      driverName: fuelLog.driverName,
      fuelQuantity: fuelLog.fuelQuantity,
      fuelCost: fuelLog.fuelCost,
      fuelStation: fuelLog.fuelStation,
      odometerReading: fuelLog.odometerReading,
      date: toDateInputValue(fuelLog.date),
      notes: fuelLog.notes || '',
    })
  }

  const editMaintenanceRecord = (record) => {
    setEditingMaintenanceId(getRecordId(record))
    setMaintenanceForm({
      vehicleId: record.vehicleId,
      vehicleName: record.vehicleName,
      serviceType: record.serviceType,
      nextServiceDate: toDateInputValue(record.nextServiceDate),
      cost: record.cost,
      mechanicName: record.mechanicName,
      status: record.status,
      reminderDate: toDateInputValue(record.reminderDate),
      notes: record.notes || '',
    })
  }

  const deleteFuelLog = async (id) => {
    setError('')
    setSaveMessage('')
    try {
      await fuelMaintenanceApi.deleteFuelLog(id, getAuthToken)
      setFuelLogs((currentLogs) => currentLogs.filter((log) => getRecordId(log) !== id))
      setSummary(await fuelMaintenanceApi.getSummary(getAuthToken))
      setSaveMessage('Fuel log deleted successfully.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const deleteMaintenanceRecord = async (id) => {
    setError('')
    setSaveMessage('')
    try {
      await fuelMaintenanceApi.deleteMaintenanceRecord(id, getAuthToken)
      setMaintenanceRecords((currentRecords) => currentRecords.filter((record) => getRecordId(record) !== id))
      setSummary(await fuelMaintenanceApi.getSummary(getAuthToken))
      setSaveMessage('Maintenance record deleted successfully.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const filteredFuelLogs = fuelLogs.filter((fuelLog) => {
    const searchableText = [fuelLog.vehicleName, fuelLog.driverName, fuelLog.fuelStation, fuelLog.notes].join(' ').toLowerCase()
    return searchableText.includes(fuelQuery.toLowerCase())
  })

  const filteredMaintenanceRecords = maintenanceRecords.filter((record) => {
    const searchableText = [record.vehicleName, record.serviceType, record.mechanicName, record.status, record.notes]
      .join(' ')
      .toLowerCase()
    const matchesQuery = searchableText.includes(maintenanceQuery.toLowerCase())
    const matchesStatus = maintenanceStatusFilter === 'All' || record.status === maintenanceStatusFilter

    return matchesQuery && matchesStatus
  })

  const fuelColumns = [
    { key: 'vehicleName', label: 'Vehicle', render: (fuelLog) => <strong className="cell-primary">{fuelLog.vehicleName}</strong> },
    { key: 'driverName', label: 'Driver' },
    { key: 'fuelQuantity', label: 'Quantity', render: (fuelLog) => `${fuelLog.fuelQuantity} gal` },
    { key: 'fuelCost', label: 'Fuel cost', render: (fuelLog) => formatCurrencyINR(fuelLog.fuelCost) },
    { key: 'fuelStation', label: 'Station' },
    { key: 'odometerReading', label: 'Odometer', render: (fuelLog) => Number(fuelLog.odometerReading).toLocaleString() },
    { key: 'date', label: 'Date', render: (fuelLog) => toDateInputValue(fuelLog.date) },
    {
      key: 'actions',
      label: 'Actions',
      render: (fuelLog) => (
        <div className="inline-group">
          <button className="button button-secondary button-small" type="button" onClick={() => editFuelLog(fuelLog)}>
            <Pencil className="lucide-icon" aria-hidden="true" />
            Edit
          </button>
          <button className="button button-secondary button-small" type="button" onClick={() => deleteFuelLog(getRecordId(fuelLog))}>
            Delete
          </button>
        </div>
      ),
    },
  ]

  const maintenanceColumns = [
    { key: 'vehicleName', label: 'Vehicle', render: (record) => <strong className="cell-primary">{record.vehicleName}</strong> },
    { key: 'serviceType', label: 'Service' },
    { key: 'nextServiceDate', label: 'Next service', render: (record) => toDateInputValue(record.nextServiceDate) },
    { key: 'cost', label: 'Cost', render: (record) => formatCurrencyINR(record.cost) },
    { key: 'mechanicName', label: 'Mechanic' },
    { key: 'status', label: 'Status', render: (record) => <StatusBadge status={record.status} /> },
    { key: 'reminderDate', label: 'Reminder', render: (record) => toDateInputValue(record.reminderDate) },
    {
      key: 'actions',
      label: 'Actions',
      render: (record) => (
        <div className="inline-group">
          <button className="button button-secondary button-small" type="button" onClick={() => editMaintenanceRecord(record)}>
            <Pencil className="lucide-icon" aria-hidden="true" />
            Edit
          </button>
          <button className="button button-secondary button-small" type="button" onClick={() => deleteMaintenanceRecord(getRecordId(record))}>
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Asset Health"
        title="Fuel & Maintenance"
        description="Track fuel spend, service activity, and maintenance readiness."
      />

      {error ? <p className="auth-error">{error}</p> : null}
      {saveMessage ? <p className="save-message">{saveMessage}</p> : null}
      {isLoading ? <Card title="Loading records"><p>Preparing fuel and maintenance records.</p></Card> : null}

      <section className="stat-grid" aria-label="Fuel and maintenance summary">
        <StatCard label="Total Fuel Cost" value={formatCurrencyINR(summary.totalFuelCost)} helper="Recorded fuel spend" tone="info" />
        <StatCard label="Average Mileage" value={Number(summary.averageMileage).toLocaleString()} helper="Average odometer reading" tone="success" />
        <StatCard label="Vehicles Due" value={summary.vehiclesDueForService} helper="Scheduled or overdue service" tone="warning" />
        <StatCard label="Maintenance Cost" value={formatCurrencyINR(summary.totalMaintenanceCost)} helper="Total service cost" tone="neutral" />
      </section>

      <section className="content-grid">
        <Card eyebrow={editingFuelId ? 'Edit fuel log' : 'Fuel entry'} title={editingFuelId ? 'Update fuel log' : 'Add fuel log'}>
          <form className="form-grid form-grid-single" onSubmit={submitFuelLog}>
            <Field label="Vehicle">
              <select
                className="form-control"
                value={fuelForm.vehicleId}
                onChange={(event) => handleVehicleSelection(event.target.value, setFuelForm, fuelForm)}
              >
                <option value="">Select vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={getRecordId(vehicle)} value={getRecordId(vehicle)}>{vehicle.unit}</option>
                ))}
              </select>
            </Field>
            <Field label="Driver">
              <select className="form-control" value={fuelForm.driverId} onChange={(event) => handleDriverSelection(event.target.value)}>
                <option value="">Select driver</option>
                {drivers.map((driver) => (
                  <option key={getRecordId(driver)} value={getRecordId(driver)}>{driver.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Fuel quantity">
              <input className="form-control" type="number" step="0.01" value={fuelForm.fuelQuantity} onChange={(event) => setFuelForm({ ...fuelForm, fuelQuantity: event.target.value })} />
            </Field>
            <Field label="Fuel cost">
              <input className="form-control" type="number" step="0.01" value={fuelForm.fuelCost} onChange={(event) => setFuelForm({ ...fuelForm, fuelCost: event.target.value })} />
            </Field>
            <Field label="Fuel station">
              <input className="form-control" value={fuelForm.fuelStation} onChange={(event) => setFuelForm({ ...fuelForm, fuelStation: event.target.value })} />
            </Field>
            <Field label="Odometer reading">
              <input className="form-control" type="number" value={fuelForm.odometerReading} onChange={(event) => setFuelForm({ ...fuelForm, odometerReading: event.target.value })} />
            </Field>
            <Field label="Date">
              <input className="form-control" type="date" min={today} value={fuelForm.date} onChange={(event) => setFuelForm({ ...fuelForm, date: event.target.value })} />
            </Field>
            <Field label="Notes">
              <textarea className="form-control textarea-control" rows="3" value={fuelForm.notes} onChange={(event) => setFuelForm({ ...fuelForm, notes: event.target.value })} />
            </Field>
            <div className="inline-group">
              <button className="button button-primary" type="submit" disabled={isFuelSaving}>{isFuelSaving ? 'Saving...' : editingFuelId ? 'Update fuel log' : 'Create fuel log'}</button>
              {editingFuelId ? <button className="button button-secondary" type="button" disabled={isFuelSaving} onClick={() => { setEditingFuelId(null); setFuelForm(emptyFuelForm) }}>Cancel</button> : null}
            </div>
          </form>
        </Card>

        <Card eyebrow={editingMaintenanceId ? 'Edit maintenance' : 'Maintenance entry'} title={editingMaintenanceId ? 'Update maintenance' : 'Add maintenance'}>
          <form className="form-grid form-grid-single" onSubmit={submitMaintenanceRecord}>
            <Field label="Vehicle">
              <select
                className="form-control"
                value={maintenanceForm.vehicleId}
                onChange={(event) => handleVehicleSelection(event.target.value, setMaintenanceForm, maintenanceForm)}
              >
                <option value="">Select vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={getRecordId(vehicle)} value={getRecordId(vehicle)}>{vehicle.unit}</option>
                ))}
              </select>
            </Field>
            <Field label="Service type">
              <input className="form-control" value={maintenanceForm.serviceType} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, serviceType: event.target.value })} />
            </Field>
            <Field label="Next service date">
              <input className="form-control" type="date" min={today} value={maintenanceForm.nextServiceDate} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, nextServiceDate: event.target.value })} />
            </Field>
            <Field label="Cost">
              <input className="form-control" type="number" step="0.01" value={maintenanceForm.cost} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, cost: event.target.value })} />
            </Field>
            <Field label="Mechanic">
              <input className="form-control" value={maintenanceForm.mechanicName} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, mechanicName: event.target.value })} />
            </Field>
            <Field label="Status">
              <select className="form-control" value={maintenanceForm.status} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, status: event.target.value })}>
                {maintenanceStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </Field>
            <Field label="Reminder date">
              <input className="form-control" type="date" min={today} value={maintenanceForm.reminderDate} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, reminderDate: event.target.value })} />
            </Field>
            <Field label="Notes">
              <textarea className="form-control textarea-control" rows="3" value={maintenanceForm.notes} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, notes: event.target.value })} />
            </Field>
            <div className="inline-group">
              <button className="button button-primary" type="submit" disabled={isMaintenanceSaving}>{isMaintenanceSaving ? 'Saving...' : editingMaintenanceId ? 'Update maintenance' : 'Create maintenance'}</button>
              {editingMaintenanceId ? <button className="button button-secondary" type="button" disabled={isMaintenanceSaving} onClick={() => { setEditingMaintenanceId(null); setMaintenanceForm(emptyMaintenanceForm) }}>Cancel</button> : null}
            </div>
          </form>
        </Card>
      </section>

      <section className="content-grid">
        <Card className="table-shell" eyebrow="Fuel logs" title="Fuel records">
          <Toolbar>
            <Field label="Search fuel logs">
              <input
                className="form-control"
                type="search"
                value={fuelQuery}
                onChange={(event) => setFuelQuery(event.target.value)}
                placeholder="Search vehicle, driver, station..."
              />
            </Field>
          </Toolbar>
          <DataTable columns={fuelColumns} rows={filteredFuelLogs} getRowKey={getRecordId} />
        </Card>

        <Card className="table-shell" eyebrow="Maintenance logs" title="Maintenance records">
          <Toolbar>
            <Field label="Search maintenance">
              <input
                className="form-control"
                type="search"
                value={maintenanceQuery}
                onChange={(event) => setMaintenanceQuery(event.target.value)}
                placeholder="Search vehicle, service, mechanic..."
              />
            </Field>
            <Field label="Status">
              <select className="form-control" value={maintenanceStatusFilter} onChange={(event) => setMaintenanceStatusFilter(event.target.value)}>
                <option>All</option>
                {maintenanceStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </Field>
          </Toolbar>
          <DataTable columns={maintenanceColumns} rows={filteredMaintenanceRecords} getRowKey={getRecordId} />
        </Card>
      </section>
    </div>
  )
}
