import { jsPDF } from 'jspdf'
import { formatCurrencyINR } from './currency.js'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function writeLine(doc, label, value, x, y) {
  doc.setFont('helvetica', 'bold')
  doc.text(label, x, y)
  doc.setFont('helvetica', 'normal')
  doc.text(String(value || '—'), x + 42, y)
}

export function exportInvoicePdf(invoice) {
  const doc = new jsPDF()
  let y = 18

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('TransportFlow AI', 14, y)
  doc.setFontSize(12)
  doc.text('Invoice', 168, y)

  y += 12
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  writeLine(doc, 'Invoice #', invoice.invoiceNumber, 14, y)
  writeLine(doc, 'Status', invoice.paymentStatus, 120, y)
  y += 8
  writeLine(doc, 'Issue Date', formatDate(invoice.issueDate), 14, y)
  writeLine(doc, 'Due Date', formatDate(invoice.dueDate), 120, y)

  y += 16
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To', 14, y)
  doc.text('Trip Details', 120, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.text(invoice.customerName || '—', 14, y)
  doc.text(invoice.tripName || '—', 120, y)
  y += 6
  doc.text(invoice.customerEmail || '—', 14, y)
  doc.text(invoice.vehicleName || '—', 120, y)

  y += 14
  doc.setFont('helvetica', 'bold')
  doc.text('Description', 14, y)
  doc.text('Qty', 110, y)
  doc.text('Unit Price', 130, y)
  doc.text('Amount', 170, y)
  y += 3
  doc.line(14, y, 196, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  invoice.lineItems?.forEach((item) => {
    doc.text(item.description || 'Line item', 14, y)
    doc.text(String(item.quantity), 110, y)
    doc.text(formatCurrencyINR(item.unitPrice), 130, y)
    doc.text(formatCurrencyINR(item.amount), 170, y)
    y += 7
  })

  y += 5
  doc.line(110, y, 196, y)
  y += 8
  writeLine(doc, 'Subtotal', formatCurrencyINR(invoice.subtotal), 120, y)
  y += 7
  writeLine(doc, 'Tax', formatCurrencyINR(invoice.taxAmount), 120, y)
  y += 7
  writeLine(doc, 'GST', formatCurrencyINR(invoice.gstAmount), 120, y)
  y += 7
  writeLine(doc, 'Discount', formatCurrencyINR(invoice.discountAmount), 120, y)
  y += 7
  writeLine(doc, 'Total', formatCurrencyINR(invoice.totalAmount), 120, y)
  y += 7
  writeLine(doc, 'Amount Paid', formatCurrencyINR(invoice.amountPaid), 120, y)
  y += 7
  writeLine(doc, 'Balance Due', formatCurrencyINR(invoice.balanceDue), 120, y)

  if (invoice.notes) {
    y += 14
    doc.setFont('helvetica', 'bold')
    doc.text('Notes', 14, y)
    y += 7
    doc.setFont('helvetica', 'normal')
    doc.text(doc.splitTextToSize(invoice.notes, 180), 14, y)
  }

  doc.save(`invoice-${invoice.invoiceNumber || 'draft'}.pdf`)
}
