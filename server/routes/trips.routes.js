import express from 'express'
import Trip from '../models/Trip.js'
import { validate } from '../middleware/validate.js'
import { createTripSchema, updateTripSchema } from '../schemas/trip.schema.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const trips = await Trip.find({ createdByUid: req.user.uid }).sort({ scheduledDate: 1, createdAt: -1 })
    res.json(trips)
  } catch (error) {
    next(error)
  }
})

router.post('/', validate(createTripSchema), async (req, res, next) => {
  try {
    const trip = await Trip.create({
      ...req.body,
      createdByUid: req.user.uid,
      createdByEmail: req.user.email,
    })

    res.status(201).json(trip)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', validate(updateTripSchema), async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, createdByUid: req.user.uid },
      req.body,
      { new: true, runValidators: true },
    )

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    return res.json(trip)
  } catch (error) {
    return next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, createdByUid: req.user.uid })

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    return res.json({ message: 'Trip deleted' })
  } catch (error) {
    return next(error)
  }
})

export default router
