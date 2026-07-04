const PERSON_NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/
const COMPANY_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 &.',-]*$/
const BUSINESS_TEXT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 .,_/-]*$/
const LOCATION_PATTERN = /^[A-Za-z][A-Za-z .,-]*$/
const PLATE_PATTERN = /^[A-Z0-9][A-Z0-9 -]*$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function trimFormValues(values) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
  )
}

function hasLength(value, min, max) {
  return value.length >= min && value.length <= max
}

export function validatePersonName(value, label = 'Name') {
  if (!value) return `${label} is required.`
  if (!hasLength(value, 2, 80)) return `${label} must be 2-80 characters.`
  if (!PERSON_NAME_PATTERN.test(value)) return `${label} can only include letters, spaces, apostrophes, hyphens, and periods.`
  return ''
}

export function validateCompanyName(value, label = 'Company') {
  if (!value) return `${label} is required.`
  if (!hasLength(value, 2, 100)) return `${label} must be 2-100 characters.`
  if (!COMPANY_NAME_PATTERN.test(value)) return `${label} can only include letters, numbers, spaces, and common business punctuation.`
  return ''
}

export function validateBusinessText(value, label, { min = 2, max = 100 } = {}) {
  if (!value) return `${label} is required.`
  if (!hasLength(value, min, max)) return `${label} must be ${min}-${max} characters.`
  if (!BUSINESS_TEXT_PATTERN.test(value)) return `${label} can only include letters, numbers, spaces, and - _ / . , characters.`
  return ''
}

export function validateLocation(value, label) {
  if (!value) return `${label} is required.`
  if (!hasLength(value, 2, 80)) return `${label} must be 2-80 characters.`
  if (!LOCATION_PATTERN.test(value)) return `${label} can only include letters, spaces, commas, hyphens, and periods.`
  return ''
}

export function normalizePhone(value) {
  const digits = value.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
}

export function formatPhone(value) {
  const digits = normalizePhone(value)
  if (digits.length !== 10) return value.trim()
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function validatePhone(value, label = 'Phone') {
  if (!value) return `${label} is required.`
  const rawDigits = value.replace(/\D/g, '')
  const digits = normalizePhone(value)
  if (!(digits.length === 10 && (rawDigits.length === 10 || (rawDigits.length === 11 && rawDigits.startsWith('1'))))) {
    return `${label} must include a valid 10-digit phone number.`
  }
  return ''
}

export function normalizePlate(value) {
  return value.trim().toUpperCase().replace(/\s+/g, ' ')
}

export function validatePlate(value, label = 'Plate') {
  if (!value) return `${label} is required.`
  const normalized = normalizePlate(value)
  if (!hasLength(normalized, 2, 12)) return `${label} must be 2-12 characters.`
  if (!PLATE_PATTERN.test(normalized)) return `${label} can only include letters, numbers, spaces, and hyphens.`
  return ''
}

export function validateOptionalEmail(value, label = 'Email') {
  if (!value) return ''
  if (value.length > 120) return `${label} must be 120 characters or fewer.`
  if (!EMAIL_PATTERN.test(value)) return `${label} must be a valid email address.`
  return ''
}

export function parseBoundedNumber(value, label, { min, max, integer = false } = {}) {
  if (value === '' || value === null || value === undefined) {
    return { error: `${label} is required.` }
  }

  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return { error: `${label} must be a valid number.` }
  if (integer && !Number.isInteger(numberValue)) return { error: `${label} must be a whole number.` }
  if (min !== undefined && numberValue < min) return { error: `${label} must be at least ${min}.` }
  if (max !== undefined && numberValue > max) return { error: `${label} must be no more than ${max}.` }

  return { value: numberValue, error: '' }
}
