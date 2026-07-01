import mongoose from 'mongoose'

const invoiceLineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, trim: true },
    customerId: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, default: '', trim: true },
    tripId: { type: String, required: true, trim: true },
    tripName: { type: String, required: true, trim: true },
    vehicleId: { type: String, required: true, trim: true },
    vehicleName: { type: String, required: true, trim: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    lineItems: { type: [invoiceLineItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    gstRate: { type: Number, default: 0, min: 0 },
    gstAmount: { type: Number, default: 0, min: 0 },
    discountType: { type: String, enum: ['flat', 'percentage'], default: 'flat' },
    discountValue: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, default: 0, min: 0 },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Partial'], default: 'Pending' },
    paymentMethod: { type: String, default: '', trim: true },
    paymentDate: { type: Date, default: null },
    notes: { type: String, default: '', trim: true },
    createdByUid: { type: String, required: true, index: true },
    createdByEmail: { type: String, default: '' },
  },
  { timestamps: true },
)

invoiceSchema.index({ createdByUid: 1, invoiceNumber: 1 }, { unique: true })
invoiceSchema.index({ createdByUid: 1, createdAt: -1 })
invoiceSchema.index({ createdByUid: 1, paymentStatus: 1 })

export default mongoose.model('Invoice', invoiceSchema)
