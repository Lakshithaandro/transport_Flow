import express from 'express'
import FuelLog from '../models/FuelLog.js'
import { createFuelLogSchema, updateFuelLogSchema } from '../schemas/fuelLog.schema.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const fuelLogs = await FuelLog.find({ createdByUid: req.user.uid }).sort({ date: -1, createdAt: -1 })
    res.json(fuelLogs)
  } catch (error) {
    next(error)
  }
})

router.post('/', validate(createFuelLogSchema), async (req, res, next) => {
  try {
    const fuelLog = await FuelLog.create({
      ...req.body,
      createdByUid: req.user.uid,
      createdByEmail: req.user.email,
    })
    res.status(201).json(fuelLog)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', validate(updateFuelLogSchema), async (req, res, next) => {
  try {
    const fuelLog = await FuelLog.findOneAndUpdate(
      { _id: req.params.id, createdByUid: req.user.uid },
      req.body,
      { new: true, runValidators: true },
    )

    if (!fuelLog) {
      return res.status(404).json({ message: 'Fuel log not found' })
    }

    return res.json(fuelLog)
  } catch (error) {
    return next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const fuelLog = await FuelLog.findOneAndDelete({ _id: req.params.id, createdByUid: req.user.uid })

    if (!fuelLog) {
      return res.status(404).json({ message: 'Fuel log not found' })
    }

    return res.json({ message: 'Fuel log deleted' })
  } catch (error) {
    return next(error)
  }
})

export default router
