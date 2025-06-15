// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone number validation (international format)
export const isValidPhone = (phone: string): boolean => {
  // Basic international phone format validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

// VAT number validation (basic format for EU)
export const isValidVAT = (vat: string): boolean => {
  // Basic EU VAT format: 2 letter country code + 8-12 digits
  const vatRegex = /^[A-Z]{2}[0-9A-Z]{8,12}$/
  return vatRegex.test(vat.toUpperCase())
}

// Postal code validation (basic format)
export const isValidPostalCode = (postalCode: string, country: string): boolean => {
  // Add country-specific postal code validation
  const postalCodeFormats: { [key: string]: RegExp } = {
    SI: /^\d{4}$/, // Slovenia
    AT: /^\d{4}$/, // Austria
    DE: /^\d{5}$/, // Germany
    IT: /^\d{5}$/, // Italy
    HR: /^\d{5}$/, // Croatia
    HU: /^\d{4}$/, // Hungary
    // Add more countries as needed
  }

  const format = postalCodeFormats[country.toUpperCase()]
  return format ? format.test(postalCode) : true // Return true if country format not found
}

// Password validation
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
  return passwordRegex.test(password)
}

// Address validation
export const isValidAddress = (address: {
  firstName: string
  lastName: string
  address1: string
  city: string
  postalCode: string
  country: string
  phone: string
  isBusiness?: boolean
  businessName?: string
  vatNumber?: string
}): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {}

  // Required fields
  if (!address.firstName.trim()) errors.firstName = 'First name is required'
  if (!address.lastName.trim()) errors.lastName = 'Last name is required'
  if (!address.address1.trim()) errors.address1 = 'Address is required'
  if (!address.city.trim()) errors.city = 'City is required'
  if (!address.postalCode.trim()) errors.postalCode = 'Postal code is required'
  if (!address.country.trim()) errors.country = 'Country is required'
  if (!address.phone.trim()) errors.phone = 'Phone number is required'

  // Format validation
  if (address.phone && !isValidPhone(address.phone)) {
    errors.phone = 'Invalid phone number format'
  }

  if (address.postalCode && !isValidPostalCode(address.postalCode, address.country)) {
    errors.postalCode = 'Invalid postal code format'
  }

  // Business validation
  if (address.isBusiness) {
    if (!address.businessName?.trim()) {
      errors.businessName = 'Business name is required'
    }
    if (!address.vatNumber?.trim()) {
      errors.vatNumber = 'VAT number is required'
    } else if (!isValidVAT(address.vatNumber)) {
      errors.vatNumber = 'Invalid VAT number format'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
