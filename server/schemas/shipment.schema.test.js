import { describe, expect, it } from 'vitest'
import { createShipmentSchema } from './shipment.schema.js'

describe('createShipmentSchema', () => {
  const validShipment = {
    shipmentNumber: 'SHP-1001',
    customerName: 'Acme Logistics',
    customerEmail: 'ops@acme.test',
    origin: 'Colombo',
    destination: 'Kandy',
    pickupDate: '2026-07-10',
    deliveryDate: '2026-07-12',
    status: 'Pending',
  }

  it('accepts a valid shipment payload', () => {
    const result = createShipmentSchema.safeParse(validShipment)

    expect(result.success).toBe(true)
  })

  it('rejects delivery dates before pickup dates', () => {
    const result = createShipmentSchema.safeParse({
      ...validShipment,
      pickupDate: '2026-07-12',
      deliveryDate: '2026-07-10',
    })

    expect(result.success).toBe(false)
    expect(result.error.flatten().fieldErrors.deliveryDate).toContain('Delivery date cannot be before pickup date')
  })

  it('rejects unsupported shipment statuses', () => {
    const result = createShipmentSchema.safeParse({ ...validShipment, status: 'Lost' })

    expect(result.success).toBe(false)
  })
})
