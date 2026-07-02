import { useEffect, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Field from '../../components/ui/Field.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Toolbar from '../../components/ui/Toolbar.jsx'
import useAuth from '../../context/useAuth.js'
import { adminApi } from '../../services/adminApi.js'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function getShipmentId(shipment) {
  return shipment._id || shipment.id
}

function toDateInputValue(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

export default function AdminShipments() {
  const { getAuthToken } = useAuth()
  const [shipments, setShipments] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [filters, setFilters] = useState({ search: '', status: 'All', sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 10 })
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [editForm, setEditForm] = useState({ status: 'Pending', driverName: '', vehicleName: '', notes: '' })
  const [confirmAction, setConfirmAction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadShipments() {
      setIsLoading(true)
      setError('')

      try {
        const data = await adminApi.getShipments(filters, getAuthToken)
        if (!ignore) {
          setShipments(data.items || [])
          setMeta({ page: data.page, totalPages: data.totalPages, total: data.total })
        }
      } catch (requestError) {
        if (!ignore) setError(requestError.message)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadShipments()

    return () => {
      ignore = true
    }
  }, [filters, getAuthToken])

  const reloadShipments = async () => {
    const data = await adminApi.getShipments(filters, getAuthToken)
    setShipments(data.items || [])
    setMeta({ page: data.page, totalPages: data.totalPages, total: data.total })
  }

  const updateFilters = (updates) => {
    setFilters((currentFilters) => ({ ...currentFilters, ...updates, page: updates.page || 1 }))
  }

  const selectShipment = (shipment) => {
    setSelectedShipment(shipment)
    setEditForm({
      status: shipment.status,
      driverName: shipment.driverName || '',
      vehicleName: shipment.vehicleName || '',
      notes: shipment.notes || '',
    })
  }

  const updateShipment = async (shipment, payload) => {
    setError('')
    setSaveMessage('')

    try {
      const updatedShipment = await adminApi.updateShipment(getShipmentId(shipment), payload, getAuthToken)
      if (selectedShipment && getShipmentId(selectedShipment) === getShipmentId(shipment)) setSelectedShipment(updatedShipment)
      setSaveMessage('Shipment updated successfully.')
      await reloadShipments()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const submitShipmentUpdate = async (event) => {
    event.preventDefault()
    if (!selectedShipment) return
    await updateShipment(selectedShipment, editForm)
  }

  const deleteShipment = async (shipment) => {
    setConfirmAction(null)
    setError('')
    setSaveMessage('')

    try {
      await adminApi.deleteShipment(getShipmentId(shipment), getAuthToken)
      if (selectedShipment && getShipmentId(selectedShipment) === getShipmentId(shipment)) setSelectedShipment(null)
      setSaveMessage('Shipment deleted successfully.')
      await reloadShipments()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const columns = [
    { key: 'shipmentNumber', label: 'Shipment', render: (shipment) => <strong className="cell-primary">{shipment.shipmentNumber}</strong> },
    { key: 'customerName', label: 'Customer' },
    { key: 'lane', label: 'Lane', render: (shipment) => `${shipment.origin} → ${shipment.destination}` },
    { key: 'pickupDate', label: 'Pickup', render: (shipment) => formatDate(shipment.pickupDate) },
    { key: 'deliveryDate', label: 'Delivery', render: (shipment) => formatDate(shipment.deliveryDate) },
    { key: 'status', label: 'Status', render: (shipment) => <StatusBadge status={shipment.status} /> },
    { key: 'driverName', label: 'Driver', render: (shipment) => shipment.driverName || 'Unassigned' },
    {
      key: 'actions',
      label: 'Actions',
      render: (shipment) => (
        <div className="inline-group">
          <button className="button button-secondary button-small" type="button" onClick={() => selectShipment(shipment)}>View</button>
          <select className="form-control" value={shipment.status} onChange={(event) => updateShipment(shipment, { status: event.target.value })} aria-label={`Update ${shipment.shipmentNumber} status`}>
            <option>Pending</option>
            <option>In Transit</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
          <button className="button button-secondary button-small" type="button" onClick={() => setConfirmAction({ shipment })}>Delete</button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Admin" title="Shipment Management" description="Search, filter, inspect, update status, and delete shipment records." />

      {error ? <p className="auth-error">{error}</p> : null}
      {saveMessage ? <p className="save-message">{saveMessage}</p> : null}

      <section className="stat-grid" aria-label="Shipment management summary">
        <StatCard label="Shipments Found" value={meta.total || 0} helper="Matching current filters" tone="info" />
        <StatCard label="Current Page" value={meta.page || 1} helper={`${meta.totalPages || 1} total pages`} tone="neutral" />
        <StatCard label="Visible Rows" value={shipments.length} helper="Loaded from admin API" tone="success" />
        <StatCard label="Filter" value={filters.status} helper="Current shipment status filter" tone="warning" />
      </section>

      <section className="split-layout split-layout-wide">
        <Card className="table-shell" eyebrow="Shipments" title="Shipment records">
          <Toolbar>
            <Field label="Search">
              <input className="form-control" type="search" value={filters.search} onChange={(event) => updateFilters({ search: event.target.value })} placeholder="Shipment, customer, lane, driver..." />
            </Field>
            <Field label="Status">
              <select className="form-control" value={filters.status} onChange={(event) => updateFilters({ status: event.target.value })}>
                <option>All</option>
                <option>Pending</option>
                <option>In Transit</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </Field>
            <Field label="Sort by">
              <select className="form-control" value={filters.sortBy} onChange={(event) => updateFilters({ sortBy: event.target.value })}>
                <option value="createdAt">Created Date</option>
                <option value="shipmentNumber">Shipment Number</option>
                <option value="customerName">Customer</option>
                <option value="pickupDate">Pickup Date</option>
                <option value="deliveryDate">Delivery Date</option>
              </select>
            </Field>
          </Toolbar>

          {isLoading ? <Card title="Loading shipments"><p>Fetching shipment records from the admin API.</p></Card> : <DataTable columns={columns} rows={shipments} getRowKey={getShipmentId} emptyTitle="No shipments found" enablePagination={false} />}

          <div className="table-footer">
            <span className="table-meta">Page {meta.page || 1} of {meta.totalPages || 1}</span>
            <div className="table-pagination">
              <button className="button button-secondary button-small" type="button" disabled={(meta.page || 1) <= 1} onClick={() => updateFilters({ page: (meta.page || 1) - 1 })}>Previous</button>
              <button className="button button-secondary button-small" type="button" disabled={(meta.page || 1) >= (meta.totalPages || 1)} onClick={() => updateFilters({ page: (meta.page || 1) + 1 })}>Next</button>
            </div>
          </div>
        </Card>

        <Card eyebrow="Details" title={selectedShipment ? selectedShipment.shipmentNumber : 'Select a shipment'}>
          {selectedShipment ? (
            <form className="page-stack" onSubmit={submitShipmentUpdate}>
              <div className="detail-grid">
                <span>Customer</span><strong>{selectedShipment.customerName}</strong>
                <span>Lane</span><strong>{selectedShipment.origin} → {selectedShipment.destination}</strong>
                <span>Pickup</span><strong>{toDateInputValue(selectedShipment.pickupDate) || '—'}</strong>
                <span>Delivery</span><strong>{toDateInputValue(selectedShipment.deliveryDate) || '—'}</strong>
              </div>
              <Field label="Status">
                <select className="form-control" value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}>
                  <option>Pending</option>
                  <option>In Transit</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </Field>
              <Field label="Driver">
                <input className="form-control" value={editForm.driverName} onChange={(event) => setEditForm({ ...editForm, driverName: event.target.value })} />
              </Field>
              <Field label="Vehicle">
                <input className="form-control" value={editForm.vehicleName} onChange={(event) => setEditForm({ ...editForm, vehicleName: event.target.value })} />
              </Field>
              <Field label="Notes">
                <textarea className="form-control textarea-control" rows="4" value={editForm.notes} onChange={(event) => setEditForm({ ...editForm, notes: event.target.value })} />
              </Field>
              <button className="button button-primary" type="submit">Save shipment</button>
            </form>
          ) : <p>Select a shipment to view details and update status, driver, vehicle, or notes.</p>}
        </Card>
      </section>

      {confirmAction ? (
        <ConfirmModal
          title="Delete shipment?"
          message={`This will permanently delete shipment ${confirmAction.shipment.shipmentNumber} and record the action in admin activity logs.`}
          confirmLabel="Delete shipment"
          onConfirm={() => deleteShipment(confirmAction.shipment)}
          onCancel={() => setConfirmAction(null)}
        />
      ) : null}
    </div>
  )
}
