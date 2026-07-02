function sendValidationError(res, result) {
  return res.status(400).json({
    message: 'Validation failed',
    errors: result.error.flatten().fieldErrors,
  })
}

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return sendValidationError(res, result)
    }

    req.body = result.data
    return next()
  }
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      return sendValidationError(res, result)
    }

    req.validatedQuery = result.data
    return next()
  }
}
