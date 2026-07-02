import express from 'express'
import mongoose from 'mongoose'
import { validate, validateQuery } from '../../middleware/validate.js'
import Shipment from '../../models/Shipment.js'
import { shipmentQuerySchema, updateShipmentSchema } from '../../schemas/shipment.schema.js'
import { logAdminActivity } from '../../services/adminActivityService.js'

const router = express.Router()

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function validateObjectId(id, res) {
  if (mongoose.Types.ObjectId.isValid(id)) return true
  res.status(400).json({ message: 'Invalid shipment id' })
  return false
}

function buildShipmentQuery(queryParams) {
  const query = {}

  if (queryParams.search) {
    const searchRegex = new RegExp(escapeRegExp(queryParams.search), 'i')
    query.$or = [
      { shipmentNumber: searchRegex },
      { customerName: searchRegex },
      { customerEmail: searchRegex },
      { origin: searchRegex },
      { destination: searchRegex },
      { driverName: searchRegex },
      { vehicleName: searchRegex },
    ]
  }

  if (queryParams.status !== 'All') query.status = queryParams.status

  return query
}

router.get('/', validateQuery(shipmentQuerySchema), async (req, res, next) => {
  try {
    const queryParams = req.validatedQuery
    const page = Number(queryParams.page) || 1
    const limit = Math.min(Number(queryParams.limit) || 10, 100)
    const skip = (page - 1) * limit
    const query = buildShipmentQuery(queryParams)
    const sortFieldMap = {
      shipmentNumber: 'shipmentNumber',
      customerName: 'customerName',
      pickupDate: 'pickupDate',
      deliveryDate: 'deliveryDate',
      createdAt: 'createdAt',
    }
    const sortField = sortFieldMap[queryParams.sortBy] || 'createdAt'
    const sortDirection = queryParams.sortOrder === 'asc' ? 1 : -1

    const [items, total] = await Promise.all([
      Shipment.find(query).sort({ [sortField]: sortDirection }).skip(skip).limit(limit),
      Shipment.countDocuments(query),
    ])

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id, res)) return

    const shipment = await Shipment.findById(req.params.id)

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' })
    }

    return res.json(shipment)
  } catch (error) {
    return next(error)
  }
})

router.patch('/:id', validate(updateShipmentSchema), async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id, res)) return

    const previousShipment = await Shipment.findById(req.params.id)

    if (!previousShipment) {
      return res.status(404).json({ message: 'Shipment not found' })
    }

    Object.assign(previousShipment, req.body, { updatedByUid: req.user.uid })
    await previousShipment.save()

    logAdminActivity(req, {
      action: req.body.status ? 'shipment_updated' : 'shipment_details_updated',
      targetType: 'shipment',
      targetId: previousShipment._id,
      metadata: {
        shipmentNumber: previousShipment.shipmentNumber,
        status: previousShipment.status,
      },
    })

    return res.json(previousShipment)
  } catch (error) {
    return next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id, res)) return

    const shipment = await Shipment.findByIdAndDelete(req.params.id)

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' })
    }

    logAdminActivity(req, {
      action: 'shipment_deleted',
      targetType: 'shipment',
      targetId: shipment._id,
      metadata: { shipmentNumber: shipment.shipmentNumber, status: shipment.status },
    })

    return res.json({ message: 'Shipment deleted' })
  } catch (error) {
    return next(error)
  }
})

export default router
