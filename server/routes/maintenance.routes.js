import express from 'express'
import MaintenanceRecord from '../models/MaintenanceRecord.js'
import { createMaintenanceSchema, updateMaintenanceSchema } from '../schemas/maintenance.schema.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const records = await MaintenanceRecord.find({ createdByUid: req.user.uid }).sort({ nextServiceDate: 1, createdAt: -1 })
    res.json(records)
  } catch (error) {
    next(error)
  }
})

router.post('/', validate(createMaintenanceSchema), async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.create({
      ...req.body,
      createdByUid: req.user.uid,
      createdByEmail: req.user.email,
    })
    res.status(201).json(record)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', validate(updateMaintenanceSchema), async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.findOneAndUpdate(
      { _id: req.params.id, createdByUid: req.user.uid },
      req.body,
      { new: true, runValidators: true },
    )

    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found' })
    }

    return res.json(record)
  } catch (error) {
    return next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.findOneAndDelete({ _id: req.params.id, createdByUid: req.user.uid })

    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found' })
    }

    return res.json({ message: 'Maintenance record deleted' })
  } catch (error) {
    return next(error)
  }
})

export default router
