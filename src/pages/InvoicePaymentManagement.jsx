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
import { customerRouteTripApi } from '../services/customerRouteTripApi.js'
import { invoiceApi } from '../services/invoiceApi.js'
import { vehicleDriverApi } from '../services/vehicleDriverApi.js'
import { formatCurrencyINR } from '../utils/currency.js'
import { isAfterDate, isBeforeToday, todayDateInputValue } from '../utils/date.js'
import { exportInvoicePdf } from '../utils/invoicePdf.js'

const emptyInvoiceForm = {
  customerId: '',
  customerName: '',
  customerEmail: '',
  tripId: '',
  tripName: '',
  vehicleId: '',
  vehicleName: '',
  issueDate: '',
  dueDate: '',
  lineItems: [{ description: '', quantity: '1', unitPrice: '' }],
  taxRate: '',
  gstRate: '',
  discountType: 'flat',
  discountValue: '',
  amountPaid: '',
  paymentMethod: '',
  paymentDate: '',
  notes: '',
}

function getRecordId(record) {
  return record._id || record.id
}

function toDateInputValue(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100
}

function calculateInvoicePreview(form) {
  const subtotal = roundCurrency(
    form.lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0),
  )
  const taxAmount = roundCurrency((subtotal * (Number(form.taxRate) || 0)) / 100)
  const gstAmount = roundCurrency((subtotal * (Number(form.gstRate) || 0)) / 100)
  const discountValue = Number(form.discountValue) || 0
  const discountAmount = roundCurrency(form.discountType === 'percentage' ? (subtotal * discountValue) / 100 : discountValue)
  const totalAmount = Math.max(roundCurrency(subtotal + taxAmount + gstAmount - discountAmount), 0)
  const amountPaid = roundCurrency(Number(form.amountPaid) || 0)
  const balanceDue = Math.max(roundCurrency(totalAmount - amountPaid), 0)
  const paymentStatus = amountPaid >= totalAmount && totalAmount > 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Pending'

  return { subtotal, taxAmount, gstAmount, discountAmount, totalAmount, amountPaid, balanceDue, paymentStatus }
}

export default function InvoicePaymentManagement() {
  const { getAuthToken } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [customers, setCustomers] = useState([])
  const [trips, setTrips] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    paidRevenue: 0,
    outstandingBalance: 0,
    invoiceCount: 0,
  })
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('')
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm)
  const [editingInvoiceId, setEditingInvoiceId] = useState(null)
  const [invoiceQuery, setInvoiceQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const today = todayDateInputValue()

  const loadInvoices = async () => {
    setIsLoading(true)
    setError('')

    try {
      const [invoiceData, summaryData, numberData, customerData, tripData, vehicleData] = await Promise.all([
        invoiceApi.getInvoices(getAuthToken),
        invoiceApi.getRevenueSummary(getAuthToken),
        invoiceApi.getNextInvoiceNumber(getAuthToken),
        customerRouteTripApi.getCustomers(getAuthToken),
        customerRouteTripApi.getTrips(getAuthToken),
        vehicleDriverApi.getVehicles(getAuthToken),
      ])
      setInvoices(invoiceData)
      setSummary(summaryData)
      setNextInvoiceNumber(numberData.invoiceNumber)
      setCustomers(customerData)
      setTrips(tripData)
      setVehicles(vehicleData)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvoices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const preview = calculateInvoicePreview(invoiceForm)

  const updateLineItem = (index, key, value) => {
    setInvoiceForm((currentForm) => ({
      ...currentForm,
      lineItems: currentForm.lineItems.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }))
  }

  const addLineItem = () => {
    setInvoiceForm((currentForm) => ({
      ...currentForm,
      lineItems: [...currentForm.lineItems, { description: '', quantity: '1', unitPrice: '' }],
    }))
  }

  const removeLineItem = (index) => {
    setInvoiceForm((currentForm) => ({
      ...currentForm,
      lineItems: currentForm.lineItems.filter((item, itemIndex) => itemIndex !== index),
    }))
  }

  const selectCustomer = (customerId) => {
    const customer = customers.find((item) => getRecordId(item) === customerId)
    setInvoiceForm({
      ...invoiceForm,
      customerId,
      customerName: customer?.company || '',
      customerEmail: customer?.email || '',
    })
  }

  const selectTrip = (tripId) => {
    const trip = trips.find((item) => getRecordId(item) === tripId)
    setInvoiceForm({
      ...invoiceForm,
      tripId,
      tripName: trip ? `${trip.route} - ${toDateInputValue(trip.scheduledDate)}` : '',
    })
  }

  const selectVehicle = (vehicleId) => {
    const vehicle = vehicles.find((item) => getRecordId(item) === vehicleId)
    setInvoiceForm({
      ...invoiceForm,
      vehicleId,
      vehicleName: vehicle?.unit || '',
    })
  }

  const resetForm = async () => {
    setInvoiceForm(emptyInvoiceForm)
    setEditingInvoiceId(null)
    try {
      const numberData = await invoiceApi.getNextInvoiceNumber(getAuthToken)
      setNextInvoiceNumber(numberData.invoiceNumber)
    } catch {
      setNextInvoiceNumber('')
    }
  }

  const submitInvoice = async (event) => {
    event.preventDefault()
    setError('')
    setSaveMessage('')

    if (!invoiceForm.customerId || !invoiceForm.tripId || !invoiceForm.vehicleId) {
      setError('Customer, trip, and vehicle selections are required.')
      return
    }

    if (isBeforeToday(invoiceForm.issueDate)) {
      setError('Issue date cannot be in the past.')
      return
    }

    if (isBeforeToday(invoiceForm.dueDate)) {
      setError('Due date cannot be in the past.')
      return
    }

    if (isAfterDate(invoiceForm.issueDate, invoiceForm.dueDate)) {
      setError('Due date cannot be before issue date.')
      return
    }

    if (invoiceForm.paymentDate && isBeforeToday(invoiceForm.paymentDate)) {
      setError('Payment date cannot be in the past.')
      return
    }

    const payload = {
      ...invoiceForm,
      lineItems: invoiceForm.lineItems.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      taxRate: Number(invoiceForm.taxRate) || 0,
      gstRate: Number(invoiceForm.gstRate) || 0,
      discountValue: Number(invoiceForm.discountValue) || 0,
      amountPaid: Number(invoiceForm.amountPaid) || 0,
      paymentDate: invoiceForm.paymentDate || null,
    }

    setIsSaving(true)

    try {
      if (editingInvoiceId) {
        const updatedInvoice = await invoiceApi.updateInvoice(editingInvoiceId, payload, getAuthToken)
        setInvoices((currentInvoices) => currentInvoices.map((invoice) => (getRecordId(invoice) === editingInvoiceId ? updatedInvoice : invoice)))
        setSaveMessage('Invoice updated successfully.')
      } else {
        const createdInvoice = await invoiceApi.createInvoice(payload, getAuthToken)
        setInvoices((currentInvoices) => [createdInvoice, ...currentInvoices])
        setSaveMessage('Invoice created successfully.')
      }
      setSummary(await invoiceApi.getRevenueSummary(getAuthToken))
      await resetForm()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const editInvoice = (invoice) => {
    setEditingInvoiceId(getRecordId(invoice))
    setInvoiceForm({
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail || '',
      tripId: invoice.tripId,
      tripName: invoice.tripName,
      vehicleId: invoice.vehicleId,
      vehicleName: invoice.vehicleName,
      issueDate: toDateInputValue(invoice.issueDate),
      dueDate: toDateInputValue(invoice.dueDate),
      lineItems: invoice.lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      taxRate: invoice.taxRate,
      gstRate: invoice.gstRate,
      discountType: invoice.discountType,
      discountValue: invoice.discountValue,
      amountPaid: invoice.amountPaid,
      paymentMethod: invoice.paymentMethod || '',
      paymentDate: toDateInputValue(invoice.paymentDate),
      notes: invoice.notes || '',
    })
    setNextInvoiceNumber(invoice.invoiceNumber)
  }

  const deleteInvoice = async (id) => {
    setError('')
    setSaveMessage('')
    try {
      await invoiceApi.deleteInvoice(id, getAuthToken)
      setInvoices((currentInvoices) => currentInvoices.filter((invoice) => getRecordId(invoice) !== id))
      setSummary(await invoiceApi.getRevenueSummary(getAuthToken))
      setSaveMessage('Invoice deleted successfully.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const searchableText = [invoice.invoiceNumber, invoice.customerName, invoice.tripName, invoice.vehicleName, invoice.notes].join(' ').toLowerCase()
    const matchesQuery = searchableText.includes(invoiceQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || invoice.paymentStatus === statusFilter

    return matchesQuery && matchesStatus
  })

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice', render: (invoice) => <strong className="cell-primary">{invoice.invoiceNumber}</strong> },
    { key: 'customerName', label: 'Customer' },
    { key: 'tripName', label: 'Trip' },
    { key: 'vehicleName', label: 'Vehicle' },
    { key: 'totalAmount', label: 'Total', render: (invoice) => formatCurrencyINR(invoice.totalAmount) },
    { key: 'balanceDue', label: 'Balance', render: (invoice) => formatCurrencyINR(invoice.balanceDue) },
    { key: 'paymentStatus', label: 'Status', render: (invoice) => <StatusBadge status={invoice.paymentStatus} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (invoice) => (
        <div className="inline-group">
          <button className="button button-secondary button-small" type="button" onClick={() => editInvoice(invoice)}>
            <Pencil className="lucide-icon" aria-hidden="true" />
            Edit
          </button>
          <button className="button button-secondary button-small" type="button" onClick={() => exportInvoicePdf(invoice)}>Export PDF</button>
          <button className="button button-secondary button-small" type="button" onClick={() => deleteInvoice(getRecordId(invoice))}>Delete</button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Billing"
        title="Invoices & Payments"
        description="Create invoices, track balances, manage payment status, and export PDF invoices."
      />

      {error ? <p className="auth-error">{error}</p> : null}
      {saveMessage ? <p className="save-message">{saveMessage}</p> : null}
      {isLoading ? <Card title="Loading invoices"><p>Fetching invoices and revenue dashboard from the backend API.</p></Card> : null}

      <section className="stat-grid" aria-label="Revenue dashboard">
        <StatCard label="Total Revenue" value={formatCurrencyINR(summary.totalRevenue)} helper="All invoice totals" tone="info" />
        <StatCard label="Paid Revenue" value={formatCurrencyINR(summary.paidRevenue)} helper={`${summary.paidCount || 0} paid invoices`} tone="success" />
        <StatCard label="Outstanding" value={formatCurrencyINR(summary.outstandingBalance)} helper="Pending and partial balances" tone="warning" />
        <StatCard label="Invoices" value={summary.invoiceCount || 0} helper={`${summary.pendingCount || 0} pending · ${summary.partialCount || 0} partial`} tone="neutral" />
      </section>

      <section className="split-layout split-layout-wide">
        <Card className="table-shell" eyebrow="Invoices" title="Invoice records">
          <Toolbar>
            <Field label="Search invoices">
              <input className="form-control" type="search" value={invoiceQuery} onChange={(event) => setInvoiceQuery(event.target.value)} placeholder="Search invoice, customer, trip..." />
            </Field>
            <Field label="Payment status">
              <select className="form-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Partial</option>
              </select>
            </Field>
          </Toolbar>
          <DataTable columns={columns} rows={filteredInvoices} getRowKey={getRecordId} />
        </Card>

        <Card eyebrow="Revenue preview" title="Invoice totals">
          <div className="detail-grid">
            <span>Invoice Number</span>
            <strong>{nextInvoiceNumber || 'Generated on create'}</strong>
            <span>Subtotal</span>
            <strong>{formatCurrencyINR(preview.subtotal)}</strong>
            <span>Tax</span>
            <strong>{formatCurrencyINR(preview.taxAmount)}</strong>
            <span>GST</span>
            <strong>{formatCurrencyINR(preview.gstAmount)}</strong>
            <span>Discount</span>
            <strong>{formatCurrencyINR(preview.discountAmount)}</strong>
            <span>Total</span>
            <strong>{formatCurrencyINR(preview.totalAmount)}</strong>
            <span>Balance</span>
            <strong>{formatCurrencyINR(preview.balanceDue)}</strong>
            <span>Status</span>
            <StatusBadge status={preview.paymentStatus} />
          </div>
        </Card>
      </section>

      <Card eyebrow={editingInvoiceId ? 'Edit invoice' : 'Create invoice'} title="Invoice form">
        <form className="page-stack" onSubmit={submitInvoice}>
          <section className="form-grid">
            <Field label="Issue Date">
              <input className="form-control" type="date" min={today} value={invoiceForm.issueDate} onChange={(event) => setInvoiceForm({ ...invoiceForm, issueDate: event.target.value })} required />
            </Field>
            <Field label="Due Date">
              <input className="form-control" type="date" min={today} value={invoiceForm.dueDate} onChange={(event) => setInvoiceForm({ ...invoiceForm, dueDate: event.target.value })} required />
            </Field>
            <Field label="Customer Selection">
              <select className="form-control" value={invoiceForm.customerId} onChange={(event) => selectCustomer(event.target.value)} required>
                <option value="">Select customer</option>
                {customers.map((customer) => <option key={getRecordId(customer)} value={getRecordId(customer)}>{customer.company}</option>)}
              </select>
            </Field>
            <Field label="Trip Selection">
              <select className="form-control" value={invoiceForm.tripId} onChange={(event) => selectTrip(event.target.value)} required>
                <option value="">Select trip</option>
                {trips.map((trip) => <option key={getRecordId(trip)} value={getRecordId(trip)}>{trip.route} - {toDateInputValue(trip.scheduledDate)}</option>)}
              </select>
            </Field>
            <Field label="Vehicle Selection">
              <select className="form-control" value={invoiceForm.vehicleId} onChange={(event) => selectVehicle(event.target.value)} required>
                <option value="">Select vehicle</option>
                {vehicles.map((vehicle) => <option key={getRecordId(vehicle)} value={getRecordId(vehicle)}>{vehicle.unit}</option>)}
              </select>
            </Field>
            <Field label="Payment Method">
              <input className="form-control" value={invoiceForm.paymentMethod} onChange={(event) => setInvoiceForm({ ...invoiceForm, paymentMethod: event.target.value })} placeholder="Cash, Card, Bank Transfer" />
            </Field>
          </section>

          <Card eyebrow="Line items" title="Invoice services">
            <div className="page-stack">
              {invoiceForm.lineItems.map((item, index) => (
                <div className="form-grid" key={index}>
                  <Field label="Description">
                    <input className="form-control" value={item.description} onChange={(event) => updateLineItem(index, 'description', event.target.value)} required />
                  </Field>
                  <Field label="Quantity">
                    <input className="form-control" type="number" step="0.01" value={item.quantity} onChange={(event) => updateLineItem(index, 'quantity', event.target.value)} required />
                  </Field>
                  <Field label="Unit Price">
                    <input className="form-control" type="number" step="0.01" value={item.unitPrice} onChange={(event) => updateLineItem(index, 'unitPrice', event.target.value)} required />
                  </Field>
                  <Field label="Amount">
                    <input className="form-control" value={formatCurrencyINR((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))} readOnly />
                  </Field>
                  {invoiceForm.lineItems.length > 1 ? (
                    <button className="button button-secondary button-small" type="button" onClick={() => removeLineItem(index)}>Remove</button>
                  ) : null}
                </div>
              ))}
              <button className="button button-secondary button-small" type="button" onClick={addLineItem}>Add line item</button>
            </div>
          </Card>

          <section className="form-grid">
            <Field label="Tax %">
              <input className="form-control" type="number" step="0.01" value={invoiceForm.taxRate} onChange={(event) => setInvoiceForm({ ...invoiceForm, taxRate: event.target.value })} />
            </Field>
            <Field label="GST %">
              <input className="form-control" type="number" step="0.01" value={invoiceForm.gstRate} onChange={(event) => setInvoiceForm({ ...invoiceForm, gstRate: event.target.value })} />
            </Field>
            <Field label="Discount Type">
              <select className="form-control" value={invoiceForm.discountType} onChange={(event) => setInvoiceForm({ ...invoiceForm, discountType: event.target.value })}>
                <option value="flat">Flat</option>
                <option value="percentage">Percentage</option>
              </select>
            </Field>
            <Field label="Discount Value">
              <input className="form-control" type="number" step="0.01" value={invoiceForm.discountValue} onChange={(event) => setInvoiceForm({ ...invoiceForm, discountValue: event.target.value })} />
            </Field>
            <Field label="Amount Paid">
              <input className="form-control" type="number" step="0.01" value={invoiceForm.amountPaid} onChange={(event) => setInvoiceForm({ ...invoiceForm, amountPaid: event.target.value })} />
            </Field>
            <Field label="Payment Date">
              <input className="form-control" type="date" min={today} value={invoiceForm.paymentDate} onChange={(event) => setInvoiceForm({ ...invoiceForm, paymentDate: event.target.value })} />
            </Field>
          </section>

          <Field label="Notes">
            <textarea className="form-control textarea-control" rows="3" value={invoiceForm.notes} onChange={(event) => setInvoiceForm({ ...invoiceForm, notes: event.target.value })} />
          </Field>

          <div className="inline-group">
            <button className="button button-primary" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : editingInvoiceId ? 'Update invoice' : 'Create invoice'}</button>
            {editingInvoiceId ? <button className="button button-secondary" type="button" onClick={resetForm} disabled={isSaving}>Cancel edit</button> : null}
          </div>
        </form>
      </Card>
    </div>
  )
}
