import express from 'express'
import Driver from '../models/Driver.js'
import { validate } from '../middleware/validate.js'
import { createDriverSchema, updateDriverSchema } from '../schemas/driver.schema.js'

const router = express.Router()

function handleDuplicatePhone(error, res, next) {
  if (error?.code === 11000) {
    return res.status(409).json({ message: 'A driver with that phone number already exists' })
  }

  return next(error)
}

router.get('/', async (req, res, next) => {
  try {
    const drivers = await Driver.find({ createdByUid: req.user.uid }).sort({ name: 1, createdAt: -1 })
    res.json(drivers)
  } catch (error) {
    next(error)
  }
})

router.post('/', validate(createDriverSchema), async (req, res, next) => {
  try {
    const driver = await Driver.create({
      ...req.body,
      createdByUid: req.user.uid,
      createdByEmail: req.user.email,
    })

    res.status(201).json(driver)
  } catch (error) {
    handleDuplicatePhone(error, res, next)
  }
})

router.patch('/:id', validate(updateDriverSchema), async (req, res, next) => {
  try {
    const driver = await Driver.findOneAndUpdate(
      { _id: req.params.id, createdByUid: req.user.uid },
      req.body,
      { new: true, runValidators: true },
    )

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    return res.json(driver)
  } catch (error) {
    return handleDuplicatePhone(error, res, next)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const driver = await Driver.findOneAndDelete({ _id: req.params.id, createdByUid: req.user.uid })

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    return res.json({ message: 'Driver deleted' })
  } catch (error) {
    return next(error)
  }
})

export default router
