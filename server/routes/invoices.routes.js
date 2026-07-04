import express from 'express'
import Invoice from '../models/Invoice.js'
import { createInvoiceSchema, updateInvoiceSchema } from '../schemas/invoice.schema.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100
}

function calculateInvoiceTotals(payload) {
  const lineItems = payload.lineItems.map((item) => {
    const quantity = Number(item.quantity) || 0
    const unitPrice = Number(item.unitPrice) || 0
    return {
      description: item.description,
      quantity,
      unitPrice,
      amount: roundCurrency(quantity * unitPrice),
    }
  })

  const subtotal = roundCurrency(lineItems.reduce((sum, item) => sum + item.amount, 0))
  const taxRate = Number(payload.taxRate) || 0
  const gstRate = Number(payload.gstRate) || 0
  const discountValue = Number(payload.discountValue) || 0
  const discountType = payload.discountType || 'flat'
  const taxAmount = roundCurrency((subtotal * taxRate) / 100)
  const gstAmount = roundCurrency((subtotal * gstRate) / 100)
  const discountAmount = roundCurrency(discountType === 'percentage' ? (subtotal * discountValue) / 100 : discountValue)
  const totalAmount = Math.max(roundCurrency(subtotal + taxAmount + gstAmount - discountAmount), 0)
  const amountPaid = roundCurrency(Number(payload.amountPaid) || 0)
  const balanceDue = Math.max(roundCurrency(totalAmount - amountPaid), 0)
  const paymentStatus = amountPaid >= totalAmount && totalAmount > 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Pending'

  return {
    lineItems,
    subtotal,
    taxRate,
    taxAmount,
    gstRate,
    gstAmount,
    discountType,
    discountValue,
    discountAmount,
    totalAmount,
    amountPaid,
    balanceDue,
    paymentStatus,
  }
}

function invoiceDatePrefix(issueDate) {
  const date = new Date(issueDate)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `INV-${year}${month}${day}`
}

async function generateInvoiceNumber(createdByUid, issueDate) {
  const prefix = invoiceDatePrefix(issueDate)
  const latestInvoice = await Invoice.findOne({
    createdByUid,
    invoiceNumber: { $regex: `^${prefix}-` },
  }).sort({ invoiceNumber: -1 })

  const latestSequence = latestInvoice ? Number(latestInvoice.invoiceNumber.split('-').at(-1)) : 0
  return `${prefix}-${String(latestSequence + 1).padStart(4, '0')}`
}

function buildSearchQuery(search) {
  if (!search) return {}

  return {
    $or: [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { tripName: { $regex: search, $options: 'i' } },
      { vehicleName: { $regex: search, $options: 'i' } },
    ],
  }
}

router.get('/', async (req, res, next) => {
  try {
    const query = {
      createdByUid: req.user.uid,
      ...buildSearchQuery(req.query.search),
    }

    if (req.query.status && req.query.status !== 'All') {
      query.paymentStatus = req.query.status
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 })
    res.json(invoices)
  } catch (error) {
    next(error)
  }
})

router.get('/next-number', async (req, res, next) => {
  try {
    const invoiceNumber = await generateInvoiceNumber(req.user.uid, new Date())
    res.json({ invoiceNumber })
  } catch (error) {
    next(error)
  }
})

router.get('/revenue-summary', async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ createdByUid: req.user.uid })
    const totalRevenue = roundCurrency(invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0))
    const paidRevenue = roundCurrency(invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0))
    const outstandingBalance = roundCurrency(invoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0))
    const paidCount = invoices.filter((invoice) => invoice.paymentStatus === 'Paid').length
    const pendingCount = invoices.filter((invoice) => invoice.paymentStatus === 'Pending').length
    const partialCount = invoices.filter((invoice) => invoice.paymentStatus === 'Partial').length

    res.json({
      totalRevenue,
      paidRevenue,
      outstandingBalance,
      invoiceCount: invoices.length,
      paidCount,
      pendingCount,
      partialCount,
      averageInvoiceValue: invoices.length ? roundCurrency(totalRevenue / invoices.length) : 0,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, createdByUid: req.user.uid })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    return res.json(invoice)
  } catch (error) {
    return next(error)
  }
})

router.post('/', validate(createInvoiceSchema), async (req, res, next) => {
  try {
    const calculatedTotals = calculateInvoiceTotals(req.body)
    const invoiceNumber = await generateInvoiceNumber(req.user.uid, req.body.issueDate)
    const invoice = await Invoice.create({
      ...req.body,
      ...calculatedTotals,
      invoiceNumber,
      createdByUid: req.user.uid,
      createdByEmail: req.user.email,
    })

    res.status(201).json(invoice)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', validate(updateInvoiceSchema), async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, createdByUid: req.user.uid })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    const mergedPayload = {
      ...invoice.toObject(),
      ...req.body,
      lineItems: req.body.lineItems || invoice.lineItems,
    }
    const calculatedTotals = calculateInvoiceTotals(mergedPayload)
    Object.assign(invoice, req.body, calculatedTotals)
    await invoice.save()

    return res.json(invoice)
  } catch (error) {
    return next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, createdByUid: req.user.uid })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    return res.json({ message: 'Invoice deleted' })
  } catch (error) {
    return next(error)
  }
})

export default router
