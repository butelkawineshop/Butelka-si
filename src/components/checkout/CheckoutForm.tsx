'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useCart } from '@/hooks/useCart'
import { PaymentForm } from '@/components/checkout/PaymentForm'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import type { WineVariant, Wine } from '@butelkawineshop/types'
import { Icon } from '@/components/Icon'
import { AddressSearch } from '@/components/checkout/AddressSearch'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface Address {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  postalCode: string
  country: string
  phone: string
  isBusiness: boolean
  businessName: string
  vatNumber: string
}

interface FormData {
  shippingAddress: Address
  billingAddress: Address
  sameAsShipping: boolean
  createAccount: boolean
  email: string
  paymentMethod: 'credit_card' | 'bank_transfer' | 'pay_in_store'
}

interface FormErrors {
  [key: string]: string
}

export const CheckoutForm = () => {
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations('checkout')
  const pathname = usePathname()
  const locale = pathname.startsWith('/en') ? 'en' : 'sl'
  const confirmationPath = locale === 'en' ? '/en/confirmation' : '/potrditev'
  const { cart, total, subtotal, shipping, tax, isLoading: isCartLoading } = useCart()

  const [formData, setFormData] = useState<FormData>({
    shippingAddress: {
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      postalCode: '',
      country: '',
      phone: '',
      isBusiness: false,
      businessName: '',
      vatNumber: '',
    },
    billingAddress: {
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      postalCode: '',
      country: '',
      phone: '',
      isBusiness: false,
      businessName: '',
      vatNumber: '',
    },
    sameAsShipping: true,
    createAccount: true,
    email: '',
    paymentMethod: 'credit_card',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [accordionOpen, setAccordionOpen] = useState<'login' | 'noAccount' | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [noAccountEmail, setNoAccountEmail] = useState('')
  const [legalChecked, setLegalChecked] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const validateField = (
    name: string,
    value: string | boolean | undefined,
    isBusiness: boolean = false,
  ): string => {
    // Skip validation for optional fields
    if (name === 'address2') {
      return ''
    }

    // Handle business fields
    if (name === 'businessName' || name === 'vatNumber') {
      if (!isBusiness) {
        return ''
      }
      if (!value || (typeof value === 'string' && !value.trim())) {
        return t('validation.required')
      }
      return ''
    }

    // Handle boolean fields
    if (typeof value === 'boolean') {
      return ''
    }

    // Handle string fields
    if (typeof value === 'string') {
      if (!value.trim()) {
        return t('validation.required')
      }
      return ''
    }

    // Handle other types
    if (!value) {
      return t('validation.required')
    }

    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted') // Debug log
    console.log('Current form data:', formData) // Debug log

    // Validate form before submission
    if (!validateForm()) {
      console.log('Form validation failed') // Debug log
      toast({
        title: t('error.validationFailed'),
        description: t('error.pleaseCheckFields'),
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    console.log('Starting checkout process') // Debug log

    try {
      // Create stock reservations first
      console.log('Creating stock reservations') // Debug log
      const reservationResults = await Promise.all(
        cart?.items?.map(async (item) => {
          const variant = item.wineVariant as WineVariant
          const response = await fetch('/api/reservations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              variantId: variant.id,
              quantity: item.quantity,
              cartId: cart?.id,
            }),
          })
          const data = await response.json()
          return {
            success: data.success,
            reservationId: data.reservationId,
            message: data.message,
            variant: variant,
            quantity: item.quantity,
          }
        }) || [],
      )

      // Check if any reservations failed
      const failedReservations = reservationResults.filter((result) => !result.success)
      if (failedReservations.length > 0) {
        console.log('Some reservations failed:', failedReservations) // Debug log
        // Show error message for each failed reservation
        failedReservations.forEach((result) => {
          toast({
            title: t('error.stockUnavailable'),
            description: `${result.variant?.sku || 'Item'}: ${result.message}`,
            variant: 'destructive',
          })
        })
        return
      }

      console.log('Creating order with payment method:', formData.paymentMethod) // Debug log
      // Create order with reservations
      const orderData = {
        customer: cart?.user?.id || undefined,
        items: cart?.items?.map((item, index) => {
          const variant = item.wineVariant as WineVariant
          const reservation = reservationResults[index]
          if (!reservation) {
            throw new Error('Reservation not found')
          }
          return {
            variant: variant.id,
            quantity: item.quantity,
            price: variant.details.price,
            reservation: reservation.reservationId,
          }
        }),
        shipping,
        tax,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsShipping
          ? formData.shippingAddress
          : formData.billingAddress,
        paymentMethod: formData.paymentMethod,
        email: formData.email,
        createAccount: formData.createAccount,
        sessionId: cart?.sessionId,
      }
      console.log('Order data being sent:', orderData) // Debug log

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()
      console.log('Checkout response:', data) // Debug log

      if (!data.success) {
        throw new Error(data.message || t('error.failedToCreateOrder'))
      }

      // Handle different payment methods
      if (formData.paymentMethod === 'credit_card' && data.clientSecret) {
        console.log('Setting up card payment') // Debug log
        setOrderId(data.orderId)
        setClientSecret(data.clientSecret)
        return
      }

      // For other payment methods, redirect to order confirmation
      console.log('Redirecting to confirmation') // Debug log
      toast({
        title: t('success.orderCreated'),
        description: t('success.redirectingToConfirmation'),
      })
      router.push(`${confirmationPath}?orderId=${data.orderId}`)
    } catch (err) {
      console.error('Checkout error:', err)
      toast({
        title: t('error.checkoutFailed'),
        description: err instanceof Error ? err.message : t('error.unknownError'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    // Validate shipping address
    Object.entries(formData.shippingAddress).forEach(([key, value]) => {
      if (key !== 'address2') {
        const error = validateField(key, value, formData.shippingAddress.isBusiness)
        if (error) {
          newErrors[`shipping.${key}`] = error
          isValid = false
        }
      }
    })

    // Validate billing address if not same as shipping
    if (!formData.sameAsShipping) {
      Object.entries(formData.billingAddress).forEach(([key, value]) => {
        if (key !== 'address2') {
          const error = validateField(key, value, formData.billingAddress.isBusiness)
          if (error) {
            newErrors[`billing.${key}`] = error
            isValid = false
          }
        }
      })
    }

    // Validate email only if it's not empty
    if (formData.email && !formData.email.trim()) {
      newErrors['email'] = t('validation.required')
      isValid = false
    }

    // Validate payment method
    if (!formData.paymentMethod) {
      newErrors['paymentMethod'] = t('validation.required')
      isValid = false
    }

    setErrors(newErrors)

    // Show error toast with specific fields that need attention
    if (!isValid) {
      const missingFields = Object.keys(newErrors)
        .map((key) => {
          const fieldName = key.split('.').pop() || key
          switch (fieldName) {
            case 'firstName':
              return t('shippingAddress.firstName')
            case 'lastName':
              return t('shippingAddress.lastName')
            case 'address1':
              return t('shippingAddress.address1')
            case 'phone':
              return t('shippingAddress.phone')
            case 'email':
              return t('auth.email')
            case 'businessName':
              return t('address.businessName')
            case 'vatNumber':
              return t('address.vatNumber')
            case 'paymentMethod':
              return t('paymentMethod.title')
            default:
              return fieldName
          }
        })
        .join(', ')

      toast({
        title: t('error.validationFailed'),
        description: `${t('error.pleaseCheckFields')}: ${missingFields}`,
        variant: 'destructive',
      })
    }

    return isValid
  }

  const renderField = (
    name: keyof Address,
    label: string,
    type: string = 'text',
    required: boolean = false,
    placeholder?: string,
    isBilling: boolean = false,
  ) => {
    const error = errors[`${isBilling ? 'billing.' : 'shipping.'}${name}`]
    const value = isBilling ? formData.billingAddress[name] : formData.shippingAddress[name]
    const onChange = isBilling
      ? (e: React.ChangeEvent<HTMLInputElement>) =>
          setFormData({
            ...formData,
            billingAddress: { ...formData.billingAddress, [name]: e.target.value },
          })
      : (e: React.ChangeEvent<HTMLInputElement>) =>
          setFormData({
            ...formData,
            shippingAddress: { ...formData.shippingAddress, [name]: e.target.value },
          })

    // Special handling for address1 field
    if (name === 'address1') {
      return (
        <div>
          <label htmlFor={name} className="block text-base font-medium mb-1">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
          <AddressSearch
            value={String(value)}
            onChange={(address) => {
              console.log('Updating form with address:', address) // Debug log
              const addressUpdate = {
                address1: `${address.street_number} ${address.route}`, // Combine street number and route
                city: address.locality,
                postalCode: address.postal_code,
                country: address.country,
              }

              if (isBilling) {
                setFormData((prev) => ({
                  ...prev,
                  billingAddress: {
                    ...prev.billingAddress,
                    ...addressUpdate,
                  },
                }))
              } else {
                setFormData((prev) => ({
                  ...prev,
                  shippingAddress: {
                    ...prev.shippingAddress,
                    ...addressUpdate,
                  },
                }))
              }
            }}
            required={required}
            placeholder={placeholder || t('address.searchPlaceholder')}
            id={name}
            name={name}
            className={`w-full px-3 py-2 border rounded-md ${error ? 'border-error' : 'border-border'}`}
          />
          {error && <p className="text-error text-base mt-1">{error}</p>}
        </div>
      )
    }

    // Skip rendering city, postal code, and country fields as they're handled by the address search
    if (name === 'city' || name === 'postalCode' || name === 'country') {
      return null
    }

    return (
      <div>
        <label htmlFor={name} className="block text-base font-medium mb-1">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
        <input
          type={type}
          id={name}
          value={String(value)}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md ${error ? 'border-error' : 'border-border'}`}
          autoComplete={
            isBilling
              ? `billing ${name === 'address2' ? 'address-line2' : name}`
              : `shipping ${name === 'address2' ? 'address-line2' : name}`
          }
        />
        {error && <p className="text-error text-base mt-1">{error}</p>}
      </div>
    )
  }

  if (isCartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-error">{t('error.failedToLoadCart')}</div>
      </div>
    )
  }

  if (!stripePromise) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-error">{t('error.paymentSystemNotConfigured')}</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Title */}
      <h2 className="text-4xl font-accent text-center mb-8">{t('title')}</h2>

      {/* Cards container */}
      <div className="flex justify-center gap-6 mb-8">
        {/* Card for login */}
        <div
          className={`border border-border link-container rounded-lg p-4 cursor-pointer hover:bg-primary hover:text-black transition-colors w-32 h-32 flex flex-col items-center justify-center ${accordionOpen === 'login' ? 'bg-primary text-black' : ''}`}
          onClick={() => setAccordionOpen(accordionOpen === 'login' ? null : 'login')}
        >
          <Icon name="account" className="w-8 h-8 mb-2" />
          <h3 className="text-base font-medium text-center">{t('auth.login')}</h3>
        </div>
        {/* Card for no account */}
        <div
          className={`border border-border link-container rounded-lg p-4 cursor-pointer hover:bg-primary hover:text-black transition-colors w-32 h-32 flex flex-col items-center justify-center ${accordionOpen === 'noAccount' ? 'bg-primary text-black' : ''}`}
          onClick={() => setAccordionOpen(accordionOpen === 'noAccount' ? null : 'noAccount')}
        >
          <Icon name="no-account" className="w-8 h-8 mb-2" />
          <h3 className="text-base font-medium text-center">{t('auth.noAccount')}</h3>
        </div>
      </div>

      {/* Form fields with animation */}
      <div
        className={`transition-all duration-300 ease-in-out ${accordionOpen ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}
      >
        {accordionOpen === 'login' && (
          <div className="mt-8 p-6 rounded-md bg-muted border border-border shadow-md">
            {/* Magic link login form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                // Implement magic link logic here
              }}
              className="space-y-3"
            >
              <label
                className="block text-base font-medium text-foreground/80"
                htmlFor="loginEmail"
              >
                {t('auth.email')}
              </label>
              <input
                id="loginEmail"
                type="email"
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground shadow-sm focus:border-accent focus:ring-2 focus:ring-accent focus:outline-none placeholder:text-gray-400"
                placeholder={t('auth.emailPlaceholder')}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-accent link-container text-black py-2 px-4 rounded-md text-base font-medium "
              >
                {t('auth.sendMagicLink')}
              </button>
            </form>
          </div>
        )}

        {accordionOpen === 'noAccount' && (
          <div className="mt-8 p-6 rounded-md bg-muted border border-border shadow-md">
            {/* Address fields + email + checkboxes */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="noAccountEmail"
                  className="block text-base font-medium text-foreground/80"
                >
                  {t('auth.email')}
                </label>
                <input
                  id="noAccountEmail"
                  type="email"
                  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground shadow-sm focus:border-accent focus:ring-2 focus:ring-accent focus:outline-none placeholder:text-gray-400"
                  placeholder={t('auth.emailPlaceholder')}
                  value={noAccountEmail}
                  onChange={(e) => setNoAccountEmail(e.target.value)}
                  required
                />
              </div>
              {/* The same address fields as shippingAddress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('firstName', t('shippingAddress.firstName'))}
                {renderField('lastName', t('shippingAddress.lastName'))}
              </div>
              <div>{renderField('address1', t('shippingAddress.address1'))}</div>
              <div>{renderField('address2', t('shippingAddress.address2'), 'text', false)}</div>
              <div>{renderField('phone', t('shippingAddress.phone'), 'tel')}</div>
              <div className="mt-4">
                <div className="space-y-4">
                  {/* Is Business checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isBusiness"
                      checked={formData.shippingAddress.isBusiness}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shippingAddress: {
                            ...formData.shippingAddress,
                            isBusiness: e.target.checked,
                            businessName: e.target.checked
                              ? formData.shippingAddress.businessName
                              : '',
                            vatNumber: e.target.checked ? formData.shippingAddress.vatNumber : '',
                          },
                        })
                      }
                      className="h-4 w-4 text-accent"
                    />
                    <label htmlFor="isBusiness" className="text-base">
                      {t('address.isBusiness')}
                    </label>
                  </div>

                  {/* Business fields for shipping address */}
                  {formData.shippingAddress.isBusiness && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label htmlFor="businessName" className="block text-base font-medium mb-1">
                          {t('address.businessName')}
                        </label>
                        <input
                          type="text"
                          id="businessName"
                          value={formData.shippingAddress.businessName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shippingAddress: {
                                ...formData.shippingAddress,
                                businessName: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="vatNumber" className="block text-base font-medium mb-1">
                          {t('address.vatNumber')}
                        </label>
                        <input
                          type="text"
                          id="vatNumber"
                          value={formData.shippingAddress.vatNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shippingAddress: {
                                ...formData.shippingAddress,
                                vatNumber: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  {/* Same as shipping checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sameAsShipping"
                      checked={formData.sameAsShipping}
                      onChange={(e) =>
                        setFormData({ ...formData, sameAsShipping: e.target.checked })
                      }
                      className="h-4 w-4 text-accent"
                    />
                    <label htmlFor="sameAsShipping" className="text-base">
                      {t('billingAddress.sameAsShipping')}
                    </label>
                  </div>

                  {/* Billing address fields */}
                  {!formData.sameAsShipping && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderField(
                          'firstName',
                          t('billingAddress.firstName'),
                          'text',
                          true,
                          undefined,
                          true,
                        )}
                        {renderField(
                          'lastName',
                          t('billingAddress.lastName'),
                          'text',
                          true,
                          undefined,
                          true,
                        )}
                      </div>
                      <div>
                        {renderField(
                          'address1',
                          t('billingAddress.address1'),
                          'text',
                          true,
                          undefined,
                          true,
                        )}
                      </div>
                      <div>
                        {renderField(
                          'address2',
                          t('billingAddress.address2'),
                          'text',
                          false,
                          undefined,
                          true,
                        )}
                      </div>
                      <div>
                        {renderField(
                          'phone',
                          t('billingAddress.phone'),
                          'tel',
                          true,
                          undefined,
                          true,
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="billingIsBusiness"
                            checked={formData.billingAddress.isBusiness}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                billingAddress: {
                                  ...formData.billingAddress,
                                  isBusiness: e.target.checked,
                                  businessName: e.target.checked
                                    ? formData.billingAddress.businessName
                                    : '',
                                  vatNumber: e.target.checked
                                    ? formData.billingAddress.vatNumber
                                    : '',
                                },
                              })
                            }
                            className="h-4 w-4 text-accent"
                          />
                          <label htmlFor="billingIsBusiness" className="text-base">
                            {t('address.isBusiness')}
                          </label>
                        </div>
                      </div>
                      {formData.billingAddress.isBusiness && (
                        <div className="space-y-4 mt-4">
                          <div>
                            <label
                              htmlFor="billingBusinessName"
                              className="block text-base font-medium mb-1"
                            >
                              {t('address.businessName')}
                            </label>
                            <input
                              type="text"
                              id="billingBusinessName"
                              value={formData.billingAddress.businessName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  billingAddress: {
                                    ...formData.billingAddress,
                                    businessName: e.target.value,
                                  },
                                })
                              }
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="billingVatNumber"
                              className="block text-base font-medium mb-1"
                            >
                              {t('address.vatNumber')}
                            </label>
                            <input
                              type="text"
                              id="billingVatNumber"
                              value={formData.billingAddress.vatNumber}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  billingAddress: {
                                    ...formData.billingAddress,
                                    vatNumber: e.target.value,
                                  },
                                })
                              }
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Create account checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="createAccount"
                      checked={formData.createAccount}
                      onChange={(e) =>
                        setFormData({ ...formData, createAccount: e.target.checked })
                      }
                      className="h-4 w-4 text-accent"
                    />
                    <label htmlFor="createAccount" className="text-base">
                      {t('auth.createAccount')}
                    </label>
                  </div>

                  {/* Legal confirmation checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="legalConfirmation"
                      checked={legalChecked}
                      onChange={(e) => setLegalChecked(e.target.checked)}
                      required
                      className="h-4 w-4 text-accent"
                    />
                    <label htmlFor="legalConfirmation" className="text-base">
                      {t('auth.legalConfirmation')}
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Order summary */}
      <div className="mt-8 p-6 rounded-md bg-muted border border-border shadow-md">
        <h3 className="text-2xl font-accent mb-4">{t('summary.title')}</h3>
        <OrderSummary
          items={
            cart?.items?.map((item) => ({
              variant: item.wineVariant as WineVariant & {
                wine: Wine
                media?: { media?: { url: string }[] }
              },
              quantity: item.quantity,
              price: typeof item.wineVariant === 'object' ? item.wineVariant.details.price : 0,
              id: item.id,
            })) || []
          }
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
        />
        {/* Payment section */}
        <div className="mt-8">
          <h3 className="text-2xl font-accent mb-4">{t('paymentMethod.title')}</h3>
          {/* Payment Method Selection */}
          <div>
            <div className="grid grid-cols-1 gap-4">
              {/* Credit Card */}
              <div
                className={`flex link-container shadow-md items-center gap-2 p-3 rounded-md border cursor-pointer transition ${
                  formData.paymentMethod === 'credit_card'
                    ? 'bg-accent text-black border-accent'
                    : 'border-border hover:border-accent'
                }`}
                onClick={() => {
                  console.log('Setting payment method to credit_card') // Debug log
                  setFormData((prev) => ({ ...prev, paymentMethod: 'credit_card' }))
                }}
                tabIndex={0}
                role="button"
                aria-pressed={formData.paymentMethod === 'credit_card'}
              >
                <Icon
                  name="credit-card"
                  className={`w-5 h-5 ${formData.paymentMethod === 'credit_card' ? 'text-black' : 'text-accent'}`}
                />
                <span className="text-base">{t('paymentMethod.creditCard')}</span>
              </div>
              {/* Bank Transfer */}
              <div
                className={`flex link-container shadow-md items-center gap-2 p-3 rounded-md border cursor-pointer transition ${
                  formData.paymentMethod === 'bank_transfer'
                    ? 'bg-accent text-black border-accent'
                    : 'border-border hover:border-accent'
                }`}
                onClick={() => {
                  console.log('Setting payment method to bank_transfer') // Debug log
                  setFormData((prev) => ({ ...prev, paymentMethod: 'bank_transfer' }))
                }}
                tabIndex={0}
                role="button"
                aria-pressed={formData.paymentMethod === 'bank_transfer'}
              >
                <Icon
                  name="bank"
                  className={`w-5 h-5 ${formData.paymentMethod === 'bank_transfer' ? 'text-black' : 'text-accent'}`}
                />
                <span className="text-base">{t('paymentMethod.bankTransfer')}</span>
              </div>
              {/* Pay in Store */}
              <div
                className={`flex link-container shadow-md items-center gap-2 p-3 rounded-md border cursor-pointer transition ${
                  formData.paymentMethod === 'pay_in_store'
                    ? 'bg-accent text-black border-accent'
                    : 'border-border hover:border-accent'
                }`}
                onClick={() => {
                  console.log('Setting payment method to pay_in_store') // Debug log
                  setFormData((prev) => ({ ...prev, paymentMethod: 'pay_in_store' }))
                }}
                tabIndex={0}
                role="button"
                aria-pressed={formData.paymentMethod === 'pay_in_store'}
              >
                <Icon
                  name="in-store"
                  className={`w-5 h-5 ${formData.paymentMethod === 'pay_in_store' ? 'text-black' : 'text-accent'}`}
                />
                <span className="text-base">{t('paymentMethod.payInStore')}</span>
              </div>
            </div>
          </div>
          {/* Payment Section */}
          <div className="mt-6 ">
            {formData.paymentMethod === 'credit_card' && clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      fontFamily: 'Asap, system-ui, -apple-system, sans-serif',
                    },
                  },
                }}
              >
                {orderId && <PaymentForm orderId={orderId} />}
              </Elements>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                onClick={(e) => {
                  e.preventDefault()
                  handleSubmit(e)
                }}
                className="w-full bg-accent link-container cursor-pointer gap-2 flex items-center justify-center text-black py-3 text-base font-medium px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50"
              >
                <Icon name="pay" className="w-5 h-5" />
                {isLoading ? t('processing') : t('continueToPayment')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
