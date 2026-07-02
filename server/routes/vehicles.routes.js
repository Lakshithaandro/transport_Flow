import express from 'express'
import Vehicle from '../models/Vehicle.js'
import { validate } from '../middleware/validate.js'
import { createVehicleSchema, updateVehicleSchema } from '../schemas/vehicle.schema.js'

const router = express.Router()

function handleDuplicatePlate(error, res, next) {
  if (error?.code === 11000) {
    return res.status(409).json({ message: 'A vehicle with that plate already exists' })
  }

  return next(error)
}

router.get('/', async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ createdByUid: req.user.uid }).sort({ unit: 1, createdAt: -1 })
    res.json(vehicles)
  } catch (error) {
    next(error)
  }
})

router.post('/', validate(createVehicleSchema), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create({
      ...req.body,
      createdByUid: req.user.uid,
      createdByEmail: req.user.email,
    })

    res.status(201).json(vehicle)
  } catch (error) {
    handleDuplicatePlate(error, res, next)
  }
})

router.patch('/:id', validate(updateVehicleSchema), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, createdByUid: req.user.uid },
      req.body,
      { new: true, runValidators: true },
    )

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    return res.json(vehicle)
  } catch (error) {
    return handleDuplicatePlate(error, res, next)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, createdByUid: req.user.uid })

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    return res.json({ message: 'Vehicle deleted' })
  } catch (error) {
    return next(error)
  }
})

export default router
