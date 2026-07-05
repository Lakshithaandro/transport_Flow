import { useEffect, useState } from 'react'
import { AlertTriangle, FileText, Pencil } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import Field from '../components/ui/Field.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import Toolbar from '../components/ui/Toolbar.jsx'
import useAuth from '../context/useAuth.js'
import { vehicleDriverApi } from '../services/vehicleDriverApi.js'
import useAuth from '../context/useAuth.js'
import { vehicleDriverApi } from '../services/vehicleDriverApi.js'
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
const emptyVehicleForm = {
  unit: '',
  type: 'Tractor',
  plate: '',
  status: 'Available',
  insuranceExpiry: '',
  pucExpiry: '',
  permitExpiry: '',
  fitnessCertificateExpiry: '',
  serviceDueDate: '',
}
const emptyDriverForm = {
  name: '',
  licenseClass: 'Class A CDL',
  phone: '',
  status: 'Available',
  licenseExpiry: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  documents: [],
}
const millisecondsInDay = 1000 * 60 * 60 * 24

function getRecordId(record) {
  return record._id || record.id
}

function parseDateOnly(value) {
  if (!value) return null

  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null

  const parsedDate = new Date(year, month - 1, day)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function getTodayDateOnly() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function formatDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getTodayDateInputValue() {
  return formatDateInputValue(getTodayDateOnly())
}

function getTomorrowDateInputValue() {
  const tomorrow = getTodayDateOnly()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDateInputValue(tomorrow)
}

function getVehicleDateErrors(formValues) {
  const today = getTodayDateInputValue()
  const errors = {}

  if (formValues.insuranceExpiry && formValues.insuranceExpiry < today) {
    errors.insuranceExpiry = 'Insurance expiry date cannot be in the past.'
  } else if (formValues.insuranceExpiry && formValues.insuranceExpiry === today) {
    errors.insuranceExpiry = 'Insurance expiry date must be after today.'
  }

  if (formValues.pucExpiry && formValues.pucExpiry < today) {
    errors.pucExpiry = 'PUC expiry date cannot be in the past.'
  }

  if (formValues.permitExpiry && formValues.permitExpiry < today) {
    errors.permitExpiry = 'Permit expiry date cannot be in the past.'
  }

  if (formValues.fitnessCertificateExpiry && formValues.fitnessCertificateExpiry < today) {
    errors.fitnessCertificateExpiry = 'Fitness certificate expiry date cannot be in the past.'
  }

  if (formValues.serviceDueDate && formValues.serviceDueDate < today) {
    errors.serviceDueDate = 'Service due date cannot be earlier than today.'
  }

  return errors
}

function getDriverDateErrors(formValues) {
  const today = getTodayDateInputValue()
  const errors = {}

  if (formValues.licenseExpiry && formValues.licenseExpiry < today) {
    errors.licenseExpiry = 'Driving license expiry date cannot be in the past.'
  }

  return errors
}

function getDaysUntil(value) {
  const date = parseDateOnly(value)
  if (!date) return null

  return Math.ceil((date.getTime() - getTodayDateOnly().getTime()) / millisecondsInDay)
}

function isExpired(value) {
  const daysUntil = getDaysUntil(value)
  return daysUntil !== null && daysUntil < 0
}

function isDueTodayOrOverdue(value) {
  const daysUntil = getDaysUntil(value)
  return daysUntil !== null && daysUntil <= 0
}

function isExpiringWithin(value, days) {
  const daysUntil = getDaysUntil(value)
  return daysUntil !== null && daysUntil >= 0 && daysUntil <= days
}

function formatDate(value) {
  const date = parseDateOnly(value)
  if (!date) return 'Not set'

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDaysUntil(value) {
  const daysUntil = getDaysUntil(value)
  if (daysUntil === null) return ''
  if (daysUntil === 0) return 'today'
  if (daysUntil === 1) return 'in 1 day'
  if (daysUntil > 1) return `in ${daysUntil} days`

  const daysExpired = Math.abs(daysUntil)
  return daysExpired === 1 ? '1 day ago' : `${daysExpired} days ago`
}

function getExpiryTone(value) {
  if (!value) return 'neutral'
  if (isExpired(value)) return 'danger'
  if (isExpiringWithin(value, 15)) return 'warning'
  return 'success'
}

function createVehicleAlerts(vehicle) {
  const alerts = []

  if (isExpiringWithin(vehicle.insuranceExpiry, 15)) {
    alerts.push({
      id: `${getRecordId(vehicle)}-insurance`,
      tone: 'warning',
      title: 'Insurance expiring in 15 days',
      detail: `${vehicle.unit} insurance expires ${formatDaysUntil(vehicle.insuranceExpiry)} (${formatDate(vehicle.insuranceExpiry)}).`,
    })
  }

  if (isExpired(vehicle.permitExpiry)) {
    alerts.push({
      id: `${getRecordId(vehicle)}-permit-expired`,
      tone: 'danger',
      title: 'Permit expired',
      detail: `${vehicle.unit} permit expired ${formatDaysUntil(vehicle.permitExpiry)} (${formatDate(vehicle.permitExpiry)}).`,
    })
  } else if (isExpiringWithin(vehicle.permitExpiry, 15)) {
    alerts.push({
      id: `${getRecordId(vehicle)}-permit-expiring`,
      tone: 'warning',
      title: 'Permit expiring in 15 days',
      detail: `${vehicle.unit} permit expires ${formatDaysUntil(vehicle.permitExpiry)} (${formatDate(vehicle.permitExpiry)}).`,
    })
  }

  if (isExpired(vehicle.fitnessCertificateExpiry)) {
    alerts.push({
      id: `${getRecordId(vehicle)}-fitness-expired`,
      tone: 'danger',
      title: 'Fitness certificate expired',
      detail: `${vehicle.unit} fitness certificate expired ${formatDaysUntil(vehicle.fitnessCertificateExpiry)} (${formatDate(vehicle.fitnessCertificateExpiry)}).`,
    })
  } else if (isExpiringWithin(vehicle.fitnessCertificateExpiry, 15)) {
    alerts.push({
      id: `${getRecordId(vehicle)}-fitness-expiring`,
      tone: 'warning',
      title: 'Fitness certificate expiring in 15 days',
      detail: `${vehicle.unit} fitness certificate expires ${formatDaysUntil(vehicle.fitnessCertificateExpiry)} (${formatDate(vehicle.fitnessCertificateExpiry)}).`,
    })
  }

  if (isDueTodayOrOverdue(vehicle.serviceDueDate)) {
    alerts.push({
      id: `${getRecordId(vehicle)}-service`,
      tone: 'warning',
      title: 'Vehicle due for servicing',
      detail: `${vehicle.unit} service due date is ${formatDate(vehicle.serviceDueDate)}.`,
    })
  }

  return alerts
}

function createDriverAlerts(driver) {
  const alerts = []

  if (isExpired(driver.licenseExpiry)) {
    alerts.push({
      id: `${getRecordId(driver)}-license-expired`,
      tone: 'danger',
      title: 'License expired',
      detail: `${driver.name} license expired ${formatDaysUntil(driver.licenseExpiry)} (${formatDate(driver.licenseExpiry)}).`,
    })
  } else if (isExpiringWithin(driver.licenseExpiry, 30)) {
    alerts.push({
      id: `${getRecordId(driver)}-license-expiring`,
      tone: 'warning',
      title: 'Driving license expiring in 30 days',
      detail: `${driver.name} license expires ${formatDaysUntil(driver.licenseExpiry)} (${formatDate(driver.licenseExpiry)}).`,
    })
  }

  return alerts
}

function ExpiryBadge({ label, value }) {
  return (
    <span className="expiry-badge-row">
      <span>{label}</span>
      <Badge tone={getExpiryTone(value)}>{formatDate(value)}</Badge>
    </span>
  )
}

function renderDocuments(documents = []) {
  if (!documents.length) return <span className="cell-muted">No PDFs</span>

  return (
    <div className="document-chip-list">
      {documents.map((document) => (
        <span className="document-chip" key={`${document.name}-${document.uploadedAt || ''}`}>
          <FileText className="lucide-icon" aria-hidden="true" />
          {document.name}
        </span>
      ))}
    </div>
  )
}

export default function VehicleDriverManagement() {
  const { getAuthToken } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const { getAuthToken } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [vehicleQuery, setVehicleQuery] = useState('')
  const [driverQuery, setDriverQuery] = useState('')
  const [vehicleStatus, setVehicleStatus] = useState('All')
  const [driverStatus, setDriverStatus] = useState('All')
  const [vehicleError, setVehicleError] = useState('')
  const [driverError, setDriverError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [loadError, setLoadError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [vehicleForm, setVehicleForm] = useState(emptyVehicleForm)
  const [driverForm, setDriverForm] = useState(emptyDriverForm)
  const [editingVehicleId, setEditingVehicleId] = useState(null)
  const [editingDriverId, setEditingDriverId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVehicleSaving, setIsVehicleSaving] = useState(false)
  const [isDriverSaving, setIsDriverSaving] = useState(false)

  const loadFleetRecords = async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const [vehicleData, driverData] = await Promise.all([
        vehicleDriverApi.getVehicles(getAuthToken),
        vehicleDriverApi.getDrivers(getAuthToken),
      ])
      setVehicles(vehicleData)
      setDrivers(driverData)
    } catch (requestError) {
      setLoadError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFleetRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [vehicleForm, setVehicleForm] = useState(emptyVehicleForm)
  const [driverForm, setDriverForm] = useState(emptyDriverForm)
  const [editingVehicleId, setEditingVehicleId] = useState(null)
  const [editingDriverId, setEditingDriverId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVehicleSaving, setIsVehicleSaving] = useState(false)
  const [isDriverSaving, setIsDriverSaving] = useState(false)

  const loadFleetRecords = async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const [vehicleData, driverData] = await Promise.all([
        vehicleDriverApi.getVehicles(getAuthToken),
        vehicleDriverApi.getDrivers(getAuthToken),
      ])
      setVehicles(vehicleData)
      setDrivers(driverData)
    } catch (requestError) {
      setLoadError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFleetRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchableText = [
      vehicle.unit,
      vehicle.type,
      vehicle.plate,
      vehicle.assignedDriver,
      vehicle.insuranceExpiry,
      vehicle.pucExpiry,
      vehicle.permitExpiry,
      vehicle.fitnessCertificateExpiry,
      vehicle.serviceDueDate,
    ]
      .join(' ')
      .toLowerCase()
    const matchesQuery = searchableText.includes(vehicleQuery.toLowerCase())
    const matchesStatus = vehicleStatus === 'All' || vehicle.status === vehicleStatus

    return matchesQuery && matchesStatus
  })

  const filteredDrivers = drivers.filter((driver) => {
    const searchableText = [
      driver.name,
      driver.licenseClass,
      driver.phone,
      driver.assignedVehicle,
      driver.licenseExpiry,
      driver.emergencyContactName,
      driver.emergencyContactPhone,
      ...(driver.documents || []).map((document) => document.name),
    ]
      .join(' ')
      .toLowerCase()
    const matchesQuery = searchableText.includes(driverQuery.toLowerCase())
    const matchesStatus = driverStatus === 'All' || driver.status === driverStatus

    return matchesQuery && matchesStatus
  })

  const resetVehicleForm = () => {
    setEditingVehicleId(null)
    setVehicleForm(emptyVehicleForm)
    setVehicleError('')
  }

  const resetDriverForm = () => {
    setEditingDriverId(null)
    setDriverForm(emptyDriverForm)
    setDriverError('')
  }

  const submitVehicle = async (event) => {
  const resetVehicleForm = () => {
    setEditingVehicleId(null)
    setVehicleForm(emptyVehicleForm)
    setVehicleError('')
  }

  const resetDriverForm = () => {
    setEditingDriverId(null)
    setDriverForm(emptyDriverForm)
    setDriverError('')
  }

  const submitVehicle = async (event) => {
    event.preventDefault()
    setVehicleError('')
    setSaveMessage('')
    setSaveMessage('')

    const sanitizedForm = trimFormValues(vehicleForm)
    const normalizedPlate = normalizePlate(sanitizedForm.plate)
    const unitError = validateBusinessText(sanitizedForm.unit, 'Unit name', { min: 2, max: 40 })
    const plateError = validatePlate(sanitizedForm.plate)
    const vehicleDateFields = [
      ['insuranceExpiry', 'Insurance expiry'],
      ['pucExpiry', 'PUC expiry'],
      ['permitExpiry', 'Permit expiry'],
      ['fitnessCertificateExpiry', 'Fitness certificate expiry'],
      ['serviceDueDate', 'Service due date'],
    ]
    const missingDateField = vehicleDateFields.find(([key]) => !sanitizedForm[key])
    const vehicleDateErrors = getVehicleDateErrors(sanitizedForm)
    const vehicleDateError = Object.values(vehicleDateErrors)[0]

    if (unitError || plateError || missingDateField || vehicleDateError) {
      setVehicleError(unitError || plateError || (missingDateField ? `${missingDateField[1]} is required.` : vehicleDateError))
      return
    }

    if (!vehicleTypeOptions.includes(sanitizedForm.type) || !vehicleStatusOptions.includes(sanitizedForm.status)) {
      setVehicleError('Choose a valid vehicle type and status.')
      return
    }

    const plateExists = vehicles.some(
      (vehicle) => getRecordId(vehicle) !== editingVehicleId && normalizePlate(vehicle.plate) === normalizedPlate,
    )
    const plateExists = vehicles.some(
      (vehicle) => getRecordId(vehicle) !== editingVehicleId && normalizePlate(vehicle.plate) === normalizedPlate,
    )
    if (plateExists) {
      setVehicleError('A vehicle with that plate already exists.')
      return
    }

    const payload = { ...sanitizedForm, plate: normalizedPlate }
    setIsVehicleSaving(true)

    try {
      if (editingVehicleId) {
        const updatedVehicle = await vehicleDriverApi.updateVehicle(editingVehicleId, payload, getAuthToken)
        setVehicles((currentVehicles) =>
          currentVehicles.map((vehicle) => (getRecordId(vehicle) === editingVehicleId ? updatedVehicle : vehicle)),
        )
        setSaveMessage('Vehicle updated successfully.')
      } else {
        const createdVehicle = await vehicleDriverApi.createVehicle({ ...payload, assignedDriver: 'Unassigned', mileage: 0 }, getAuthToken)
        setVehicles((currentVehicles) => [...currentVehicles, createdVehicle])
        setSaveMessage('Vehicle created successfully.')
      }
      resetVehicleForm()
    } catch (requestError) {
      setVehicleError(requestError.message)
    } finally {
      setIsVehicleSaving(false)
    }
    const payload = { ...sanitizedForm, plate: normalizedPlate }
    setIsVehicleSaving(true)

    try {
      if (editingVehicleId) {
        const updatedVehicle = await vehicleDriverApi.updateVehicle(editingVehicleId, payload, getAuthToken)
        setVehicles((currentVehicles) =>
          currentVehicles.map((vehicle) => (getRecordId(vehicle) === editingVehicleId ? updatedVehicle : vehicle)),
        )
        setSaveMessage('Vehicle updated successfully.')
      } else {
        const createdVehicle = await vehicleDriverApi.createVehicle({ ...payload, assignedDriver: 'Unassigned', mileage: 0 }, getAuthToken)
        setVehicles((currentVehicles) => [...currentVehicles, createdVehicle])
        setSaveMessage('Vehicle created successfully.')
      }
      resetVehicleForm()
    } catch (requestError) {
      setVehicleError(requestError.message)
    } finally {
      setIsVehicleSaving(false)
    }
  }

  const submitDriver = async (event) => {
  const submitDriver = async (event) => {
    event.preventDefault()
    setDriverError('')
    setSaveMessage('')
    setSaveMessage('')

    const sanitizedForm = trimFormValues(driverForm)
    const nameError = validatePersonName(sanitizedForm.name, 'Driver name')
    const phoneError = validatePhone(sanitizedForm.phone)
    const emergencyNameError = validatePersonName(sanitizedForm.emergencyContactName, 'Emergency contact name')
    const emergencyPhoneError = validatePhone(sanitizedForm.emergencyContactPhone, 'Emergency contact phone')

    if (nameError || phoneError || emergencyNameError || emergencyPhoneError) {
      setDriverError(nameError || phoneError || emergencyNameError || emergencyPhoneError)
      return
    }

    if (!sanitizedForm.licenseExpiry) {
      setDriverError('License expiry is required.')
      return
    }

    const driverDateErrors = getDriverDateErrors(sanitizedForm)
    if (driverDateErrors.licenseExpiry) {
      setDriverError(driverDateErrors.licenseExpiry)
      return
    }

    if (!driverLicenseOptions.includes(sanitizedForm.licenseClass) || !driverStatusOptions.includes(sanitizedForm.status)) {
      setDriverError('Choose a valid license class and driver status.')
      return
    }

    const phoneExists = drivers.some(
      (driver) => getRecordId(driver) !== editingDriverId && normalizePhone(driver.phone) === normalizePhone(sanitizedForm.phone),
    )
    const phoneExists = drivers.some(
      (driver) => getRecordId(driver) !== editingDriverId && normalizePhone(driver.phone) === normalizePhone(sanitizedForm.phone),
    )
    if (phoneExists) {
      setDriverError('A driver with that phone number already exists.')
      return
    }

    const payload = {
      ...sanitizedForm,
      phone: formatPhone(sanitizedForm.phone),
      emergencyContactPhone: formatPhone(sanitizedForm.emergencyContactPhone),
      documents: driverForm.documents || [],
    }
    setIsDriverSaving(true)

    try {
      if (editingDriverId) {
        const updatedDriver = await vehicleDriverApi.updateDriver(editingDriverId, payload, getAuthToken)
        setDrivers((currentDrivers) =>
          currentDrivers.map((driver) => (getRecordId(driver) === editingDriverId ? updatedDriver : driver)),
        )
        setSaveMessage('Driver updated successfully.')
      } else {
        const createdDriver = await vehicleDriverApi.createDriver({ ...payload, assignedVehicle: 'Unassigned' }, getAuthToken)
        setDrivers((currentDrivers) => [...currentDrivers, createdDriver])
        setSaveMessage('Driver created successfully.')
      }
      resetDriverForm()
    } catch (requestError) {
      setDriverError(requestError.message)
    } finally {
      setIsDriverSaving(false)
    }
  }

  const editVehicle = (vehicle) => {
    setEditingVehicleId(getRecordId(vehicle))
    setVehicleError('')
    setSaveMessage('')
    setVehicleForm({
      unit: vehicle.unit || '',
      type: vehicle.type || 'Tractor',
      plate: vehicle.plate || '',
      status: vehicle.status || 'Available',
      insuranceExpiry: vehicle.insuranceExpiry || '',
      pucExpiry: vehicle.pucExpiry || '',
      permitExpiry: vehicle.permitExpiry || '',
      fitnessCertificateExpiry: vehicle.fitnessCertificateExpiry || '',
      serviceDueDate: vehicle.serviceDueDate || '',
    })
  }

  const editDriver = (driver) => {
    setEditingDriverId(getRecordId(driver))
    setDriverError('')
    setSaveMessage('')
    setDriverForm({
      name: driver.name || '',
      licenseClass: driver.licenseClass || 'Class A CDL',
      phone: driver.phone || '',
      status: driver.status || 'Available',
      licenseExpiry: driver.licenseExpiry || '',
      emergencyContactName: driver.emergencyContactName || '',
      emergencyContactPhone: driver.emergencyContactPhone || '',
      documents: driver.documents || [],
    })
  }

  const handleDriverDocuments = (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    const invalidFile = files.find((file) => file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))
    if (invalidFile) {
      setDriverError('Driver documents must be PDF files only.')
      event.target.value = ''
      return
    }

    const nextDocuments = files.map((file) => ({
      name: file.name,
      type: 'application/pdf',
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }))

    setDriverForm((currentForm) => ({
      ...currentForm,
      documents: [...(currentForm.documents || []), ...nextDocuments].filter(
        (document, index, documents) => documents.findIndex((item) => item.name === document.name) === index,
      ),
    }))
    setDriverError('')
    event.target.value = ''
  }

  const removeDriverDocument = (documentName) => {
    setDriverForm((currentForm) => ({
      ...currentForm,
      documents: (currentForm.documents || []).filter((document) => document.name !== documentName),
    }))
  }

  const requestDelete = (type, record) => {
    setDeleteTarget({
      type,
      id: getRecordId(record),
      id: getRecordId(record),
      label: type === 'vehicle' ? record.unit : record.name,
    })
  }

  const confirmDelete = async () => {
  const confirmDelete = async () => {
    if (!deleteTarget) return

    setLoadError('')
    setSaveMessage('')

    try {
      if (deleteTarget.type === 'vehicle') {
        await vehicleDriverApi.deleteVehicle(deleteTarget.id, getAuthToken)
        setVehicles((currentVehicles) => currentVehicles.filter((vehicle) => getRecordId(vehicle) !== deleteTarget.id))
        if (editingVehicleId === deleteTarget.id) resetVehicleForm()
        setSaveMessage('Vehicle deleted successfully.')
      }
    setLoadError('')
    setSaveMessage('')

    try {
      if (deleteTarget.type === 'vehicle') {
        await vehicleDriverApi.deleteVehicle(deleteTarget.id, getAuthToken)
        setVehicles((currentVehicles) => currentVehicles.filter((vehicle) => getRecordId(vehicle) !== deleteTarget.id))
        if (editingVehicleId === deleteTarget.id) resetVehicleForm()
        setSaveMessage('Vehicle deleted successfully.')
      }

      if (deleteTarget.type === 'driver') {
        await vehicleDriverApi.deleteDriver(deleteTarget.id, getAuthToken)
        setDrivers((currentDrivers) => currentDrivers.filter((driver) => getRecordId(driver) !== deleteTarget.id))
        if (editingDriverId === deleteTarget.id) resetDriverForm()
        setSaveMessage('Driver deleted successfully.')
      }
      if (deleteTarget.type === 'driver') {
        await vehicleDriverApi.deleteDriver(deleteTarget.id, getAuthToken)
        setDrivers((currentDrivers) => currentDrivers.filter((driver) => getRecordId(driver) !== deleteTarget.id))
        if (editingDriverId === deleteTarget.id) resetDriverForm()
        setSaveMessage('Driver deleted successfully.')
      }

      setDeleteTarget(null)
    } catch (requestError) {
      setLoadError(requestError.message)
    }
      setDeleteTarget(null)
    } catch (requestError) {
      setLoadError(requestError.message)
    }
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
      key: 'compliance',
      label: 'Compliance expiry',
      render: (vehicle) => (
        <div className="expiry-stack">
          <ExpiryBadge label="Insurance" value={vehicle.insuranceExpiry} />
          <ExpiryBadge label="PUC" value={vehicle.pucExpiry} />
          <ExpiryBadge label="Permit" value={vehicle.permitExpiry} />
          <ExpiryBadge label="Fitness" value={vehicle.fitnessCertificateExpiry} />
          <ExpiryBadge label="Service" value={vehicle.serviceDueDate} />
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'cell-actions',
      render: (vehicle) => (
        <div className="inline-group">
          <button className="button button-secondary button-small" type="button" onClick={() => editVehicle(vehicle)}>
            <Pencil className="lucide-icon" aria-hidden="true" />
            Edit
          </button>
          <button className="button button-danger button-small" type="button" onClick={() => requestDelete('vehicle', vehicle)}>
            Remove
          </button>
        </div>
        <div className="inline-group">
          <button className="button button-secondary button-small" type="button" onClick={() => editVehicle(vehicle)}>
            <Pencil className="lucide-icon" aria-hidden="true" />
            Edit
          </button>
          <button className="button button-danger button-small" type="button" onClick={() => requestDelete('vehicle', vehicle)}>
            Remove
          </button>
        </div>
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
    {
      key: 'licenseExpiry',
      label: 'License expiry',
      render: (driver) => <ExpiryBadge label="Expires" value={driver.licenseExpiry} />,
    },
    { key: 'phone', label: 'Phone' },
    {
      key: 'emergencyContact',
      label: 'Emergency contact',
      render: (driver) => (
        <span className="stacked-cell">
          <strong>{driver.emergencyContactName || 'Not set'}</strong>
          <span>{driver.emergencyContactPhone || 'Not set'}</span>
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (driver) => <StatusBadge status={driver.status} />,
    },
    { key: 'assignedVehicle', label: 'Assigned vehicle' },
    {
      key: 'documents',
      label: 'Documents',
      render: (driver) => renderDocuments(driver.documents),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'cell-actions',
      render: (driver) => (
        <div className="inline-group">
          <button className="button button-secondary button-small" type="button" onClick={() => editDriver(driver)}>
            <Pencil className="lucide-icon" aria-hidden="true" />
            Edit
          </button>
          <button className="button button-danger button-small" type="button" onClick={() => requestDelete('driver', driver)}>
            Remove
          </button>
        </div>
        <div className="inline-group">
          <button className="button button-secondary button-small" type="button" onClick={() => editDriver(driver)}>
            <Pencil className="lucide-icon" aria-hidden="true" />
            Edit
          </button>
          <button className="button button-danger button-small" type="button" onClick={() => requestDelete('driver', driver)}>
            Remove
          </button>
        </div>
      ),
    },
  ]

  const vehicleAlerts = vehicles.flatMap(createVehicleAlerts)
  const driverAlerts = drivers.flatMap(createDriverAlerts)
  const complianceAlerts = [...vehicleAlerts, ...driverAlerts]
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === 'Available').length
  const availableDrivers = drivers.filter((driver) => driver.status === 'Available').length
  const reviewDrivers = drivers.filter((driver) => driver.status === 'Needs Review').length
  const todayDateInputValue = getTodayDateInputValue()
  const tomorrowDateInputValue = getTomorrowDateInputValue()
  const vehicleDateErrors = getVehicleDateErrors(vehicleForm)
  const driverDateErrors = getDriverDateErrors(driverForm)

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Fleet Operations"
        title="Vehicles & Drivers"
        description="Manage fleet availability, driver readiness, compliance expiries, documents, and asset assignments."
      />

      {loadError ? <p className="auth-error">{loadError}</p> : null}
      {saveMessage ? <p className="save-message">{saveMessage}</p> : null}
      {isLoading ? <Card title="Loading fleet records"><p>Fetching vehicles and drivers from the backend API.</p></Card> : null}

      {loadError ? <p className="auth-error">{loadError}</p> : null}
      {saveMessage ? <p className="save-message">{saveMessage}</p> : null}
      {isLoading ? <Card title="Loading fleet records"><p>Fetching vehicles and drivers from the backend API.</p></Card> : null}

      <section className="stat-grid" aria-label="Vehicle and driver summary">
        <StatCard label="Vehicles" value={vehicles.length} helper="Fleet records" tone="info" />
        <StatCard label="Available vehicles" value={availableVehicles} helper="Ready for dispatch" tone="success" />
        <StatCard label="Drivers" value={drivers.length} helper={`${availableDrivers} ready`} tone="info" />
        <StatCard label="Compliance alerts" value={complianceAlerts.length} helper={`${reviewDrivers} drivers need review`} tone="warning" />
      </section>

      <Card eyebrow="Alerts" title="Fleet and driver compliance alerts">
        {complianceAlerts.length ? (
          <div className="alert-grid">
            {complianceAlerts.map((alert) => (
              <article className={`alert-card alert-card-${alert.tone}`} key={alert.id}>
                <AlertTriangle className="lucide-icon" aria-hidden="true" />
                <div>
                  <strong>{alert.title}</strong>
                  <p>{alert.detail}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>No active insurance, permit, servicing, or license expiry alerts.</p>
        )}
      </Card>

      <section className="split-layout split-layout-wide">
        <Card className="table-shell" eyebrow="Vehicles" title="Vehicle records">
          <Toolbar>
            <Field label="Search vehicles">
              <input
                className="form-control"
                type="search"
                value={vehicleQuery}
                onChange={(event) => setVehicleQuery(event.target.value)}
                placeholder="Search unit, type, plate, expiry..."
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
          <DataTable columns={vehicleColumns} rows={filteredVehicles} getRowKey={getRecordId} />
          <DataTable columns={vehicleColumns} rows={filteredVehicles} getRowKey={getRecordId} />
        </Card>

        <Card eyebrow={editingVehicleId ? 'Edit vehicle' : 'Add vehicle'} title={editingVehicleId ? 'Update vehicle record' : 'New vehicle record'}>
          <form className="form-grid form-grid-single" onSubmit={submitVehicle} noValidate>
        <Card eyebrow={editingVehicleId ? 'Edit vehicle' : 'Add vehicle'} title={editingVehicleId ? 'Update vehicle record' : 'New vehicle record'}>
          <form className="form-grid form-grid-single" onSubmit={submitVehicle} noValidate>
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
            <Field label="Insurance expiry" helper={vehicleDateErrors.insuranceExpiry}>
              <input
                className="form-control"
                type="date"
                min={tomorrowDateInputValue}
                value={vehicleForm.insuranceExpiry}
                onChange={(event) => setVehicleForm({ ...vehicleForm, insuranceExpiry: event.target.value })}
                required
              />
            </Field>
            <Field label="PUC expiry" helper={vehicleDateErrors.pucExpiry}>
              <input
                className="form-control"
                type="date"
                min={todayDateInputValue}
                value={vehicleForm.pucExpiry}
                onChange={(event) => setVehicleForm({ ...vehicleForm, pucExpiry: event.target.value })}
                required
              />
            </Field>
            <Field label="Permit expiry" helper={vehicleDateErrors.permitExpiry}>
              <input
                className="form-control"
                type="date"
                min={todayDateInputValue}
                value={vehicleForm.permitExpiry}
                onChange={(event) => setVehicleForm({ ...vehicleForm, permitExpiry: event.target.value })}
                required
              />
            </Field>
            <Field label="Fitness certificate expiry" helper={vehicleDateErrors.fitnessCertificateExpiry}>
              <input
                className="form-control"
                type="date"
                min={todayDateInputValue}
                value={vehicleForm.fitnessCertificateExpiry}
                onChange={(event) => setVehicleForm({ ...vehicleForm, fitnessCertificateExpiry: event.target.value })}
                required
              />
            </Field>
            <Field label="Service due date" helper={vehicleDateErrors.serviceDueDate}>
              <input
                className="form-control"
                type="date"
                min={todayDateInputValue}
                value={vehicleForm.serviceDueDate}
                onChange={(event) => setVehicleForm({ ...vehicleForm, serviceDueDate: event.target.value })}
                required
              />
            </Field>
            {vehicleError ? <p className="auth-error">{vehicleError}</p> : null}
            <div className="inline-group">
              <button className="button button-primary" type="submit" disabled={isVehicleSaving}>
                {isVehicleSaving ? 'Saving...' : editingVehicleId ? 'Update vehicle' : 'Add vehicle'}
              </button>
              {editingVehicleId ? <button className="button button-secondary" type="button" onClick={resetVehicleForm} disabled={isVehicleSaving}>Cancel edit</button> : null}
            </div>
            <div className="inline-group">
              <button className="button button-primary" type="submit" disabled={isVehicleSaving}>
                {isVehicleSaving ? 'Saving...' : editingVehicleId ? 'Update vehicle' : 'Add vehicle'}
              </button>
              {editingVehicleId ? <button className="button button-secondary" type="button" onClick={resetVehicleForm} disabled={isVehicleSaving}>Cancel edit</button> : null}
            </div>
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
                placeholder="Search name, license, phone, documents..."
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
          <DataTable columns={driverColumns} rows={filteredDrivers} getRowKey={getRecordId} />
          <DataTable columns={driverColumns} rows={filteredDrivers} getRowKey={getRecordId} />
        </Card>

        <Card eyebrow={editingDriverId ? 'Edit driver' : 'Add driver'} title={editingDriverId ? 'Update driver record' : 'New driver record'}>
          <form className="form-grid form-grid-single" onSubmit={submitDriver} noValidate>
        <Card eyebrow={editingDriverId ? 'Edit driver' : 'Add driver'} title={editingDriverId ? 'Update driver record' : 'New driver record'}>
          <form className="form-grid form-grid-single" onSubmit={submitDriver} noValidate>
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
            <Field label="License expiry" helper={driverDateErrors.licenseExpiry}>
              <input
                className="form-control"
                type="date"
                min={todayDateInputValue}
                value={driverForm.licenseExpiry}
                onChange={(event) => setDriverForm({ ...driverForm, licenseExpiry: event.target.value })}
                required
              />
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
            <Field label="Emergency contact name">
              <input
                className="form-control"
                value={driverForm.emergencyContactName}
                onChange={(event) => setDriverForm({ ...driverForm, emergencyContactName: event.target.value })}
                placeholder="Emergency contact"
                maxLength="80"
                required
              />
            </Field>
            <Field label="Emergency contact phone">
              <input
                className="form-control"
                value={driverForm.emergencyContactPhone}
                onChange={(event) => setDriverForm({ ...driverForm, emergencyContactPhone: event.target.value })}
                placeholder="(555) 000-0000"
                inputMode="tel"
                autoComplete="tel"
                maxLength="18"
                required
              />
            </Field>
            <Field label="Documents" helper="Only PDF files are accepted. File metadata is saved with the driver record.">
              <input className="form-control" type="file" accept="application/pdf,.pdf" multiple onChange={handleDriverDocuments} />
            </Field>
            {driverForm.documents.length ? (
              <div className="document-review-list" aria-label="Selected driver documents">
                {driverForm.documents.map((document) => (
                  <span className="document-chip" key={`${document.name}-${document.uploadedAt || ''}`}>
                    <FileText className="lucide-icon" aria-hidden="true" />
                    {document.name}
                    <button className="document-remove" type="button" onClick={() => removeDriverDocument(document.name)} aria-label={`Remove ${document.name}`}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
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
            <div className="inline-group">
              <button className="button button-primary" type="submit" disabled={isDriverSaving}>
                {isDriverSaving ? 'Saving...' : editingDriverId ? 'Update driver' : 'Add driver'}
              </button>
              {editingDriverId ? <button className="button button-secondary" type="button" onClick={resetDriverForm} disabled={isDriverSaving}>Cancel edit</button> : null}
            </div>
            <div className="inline-group">
              <button className="button button-primary" type="submit" disabled={isDriverSaving}>
                {isDriverSaving ? 'Saving...' : editingDriverId ? 'Update driver' : 'Add driver'}
              </button>
              {editingDriverId ? <button className="button button-secondary" type="button" onClick={resetDriverForm} disabled={isDriverSaving}>Cancel edit</button> : null}
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
