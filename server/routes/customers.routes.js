import express from 'express'
import Customer from '../models/Customer.js'
import { validate } from '../middleware/validate.js'
import { createCustomerSchema, updateCustomerSchema } from '../schemas/customer.schema.js'

const router = express.Router()

function handleDuplicatePhone(error, res, next) {
  if (error?.code === 11000) {
    return res.status(409).json({ message: 'A customer with that phone number already exists' })
  }

  return next(error)
}

router.get('/', async (req, res, next) => {
  try {
    const customers = await Customer.find({ createdByUid: req.user.uid }).sort({ company: 1, createdAt: -1 })
    res.json(customers)
  } catch (error) {
    next(error)
  }
})

router.post('/', validate(createCustomerSchema), async (req, res, next) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      createdByUid: req.user.uid,
      createdByEmail: req.user.email,
    })

    res.status(201).json(customer)
  } catch (error) {
    handleDuplicatePhone(error, res, next)
  }
})

router.patch('/:id', validate(updateCustomerSchema), async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, createdByUid: req.user.uid },
      req.body,
      { new: true, runValidators: true },
    )

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    return res.json(customer)
  } catch (error) {
    return handleDuplicatePhone(error, res, next)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, createdByUid: req.user.uid })

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    return res.json({ message: 'Customer deleted' })
  } catch (error) {
    return next(error)
  }
})

export default router
