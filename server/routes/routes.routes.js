import express from 'express'
import RouteRecord from '../models/RouteRecord.js'
import { validate } from '../middleware/validate.js'
import { createRouteSchema, updateRouteSchema } from '../schemas/route.schema.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const routes = await RouteRecord.find({ createdByUid: req.user.uid }).sort({ name: 1, createdAt: -1 })
    res.json(routes)
  } catch (error) {
    next(error)
  }
})

router.post('/', validate(createRouteSchema), async (req, res, next) => {
  try {
    const route = await RouteRecord.create({
      ...req.body,
      createdByUid: req.user.uid,
      createdByEmail: req.user.email,
    })

    res.status(201).json(route)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', validate(updateRouteSchema), async (req, res, next) => {
  try {
    const route = await RouteRecord.findOneAndUpdate(
      { _id: req.params.id, createdByUid: req.user.uid },
      req.body,
      { new: true, runValidators: true },
    )

    if (!route) {
      return res.status(404).json({ message: 'Route not found' })
    }

    return res.json(route)
  } catch (error) {
    return next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const route = await RouteRecord.findOneAndDelete({ _id: req.params.id, createdByUid: req.user.uid })

    if (!route) {
      return res.status(404).json({ message: 'Route not found' })
    }

    return res.json({ message: 'Route deleted' })
  } catch (error) {
    return next(error)
  }
})

export default router
