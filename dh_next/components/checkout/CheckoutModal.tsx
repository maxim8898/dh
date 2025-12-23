"use client"

import { useState } from "react"
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const PROCESS_CHECKOUT = gql`
  mutation ProcessCheckout(
    $cardNumber: String!
    $cardName: String!
    $expiryMonth: String!
    $expiryYear: String!
    $cvv: String!
    $billingAddress: BillingAddressInput!
  ) {
    processCheckout(
      cardNumber: $cardNumber
      cardName: $cardName
      expiryMonth: $expiryMonth
      expiryYear: $expiryYear
      cvv: $cvv
      billingAddress: $billingAddress
    ) {
      orderId
      orderNumber
      success
      message
    }
  }
`

// Zod validation schema
const checkoutSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'Card number is required')
    .transform((val) => val.replace(/\s/g, ''))
    .refine((val) => /^\d{13,19}$/.test(val), {
      message: 'Invalid card number (13-19 digits)',
    }),
  cardName: z
    .string()
    .min(1, 'Cardholder name is required')
    .min(3, 'Name must be at least 3 characters'),
  expiryMonth: z
    .string()
    .min(1, 'Expiry month is required')
    .refine((val) => {
      const month = parseInt(val)
      return month >= 1 && month <= 12
    }, 'Invalid month'),
  expiryYear: z
    .string()
    .min(1, 'Expiry year is required')
    .refine((val) => {
      const year = parseInt(val)
      const currentYear = new Date().getFullYear()
      return year >= currentYear && year <= currentYear + 20
    }, 'Invalid year'),
  cvv: z
    .string()
    .min(1, 'CVV is required')
    .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  billingAddress: z.object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    address: z
      .string()
      .min(1, 'Address is required')
      .min(5, 'Address must be at least 5 characters'),
    city: z
      .string()
      .min(1, 'City is required')
      .min(2, 'City must be at least 2 characters'),
    postalCode: z
      .string()
      .min(1, 'Postal code is required')
      .min(3, 'Postal code must be at least 3 characters'),
    country: z.string().min(2, 'Country is required'),
  }),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  totalPrice: number
  onSuccess: () => void
}

export function CheckoutModal({ isOpen, onClose, totalPrice, onSuccess }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [processCheckoutMutation] = useMutation(PROCESS_CHECKOUT)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      cardNumber: '',
      cardName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      billingAddress: {
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'US',
      },
    },
  })

  if (!isOpen) return null

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true)
    setError(null)

    try {
      const result = await processCheckoutMutation({
        variables: {
          cardNumber: data.cardNumber,
          cardName: data.cardName,
          expiryMonth: data.expiryMonth,
          expiryYear: data.expiryYear,
          cvv: data.cvv,
          billingAddress: data.billingAddress,
        },
      })

      if (result?.data?.processCheckout?.success) {
        onSuccess()
        onClose()
      } else {
        setError(result?.data?.processCheckout?.message || "Checkout failed")
      }
    } catch (err) {
      console.error("Checkout error:", err)
      setError("An error occurred during checkout. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "")
    const chunks = cleaned.match(/.{1,4}/g)
    return chunks ? chunks.join(" ") : cleaned
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value.replace(/\D/g, "").slice(0, 19))
    setValue('cardNumber', formatted, { shouldValidate: true })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">Checkout</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Card Information */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">Payment Information</h3>

              <div className="space-y-4">
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Card Number
                  </label>
                  <input
                    type="text"
                    {...register('cardNumber')}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    className={`mt-1 block w-full rounded-md border ${
                      errors.cardNumber ? 'border-red-300' : 'border-neutral-300'
                    } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                  )}
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    {...register('cardName')}
                    placeholder="John Doe"
                    className={`mt-1 block w-full rounded-md border ${
                      errors.cardName ? 'border-red-300' : 'border-neutral-300'
                    } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                  />
                  {errors.cardName && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardName.message}</p>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Month
                    </label>
                    <select
                      {...register('expiryMonth')}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.expiryMonth ? 'border-red-300' : 'border-neutral-300'
                      } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    {errors.expiryMonth && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryMonth.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Year
                    </label>
                    <select
                      {...register('expiryYear')}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.expiryYear ? 'border-red-300' : 'border-neutral-300'
                      } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    {errors.expiryYear && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryYear.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      CVV
                    </label>
                    <input
                      type="text"
                      {...register('cvv')}
                      placeholder="123"
                      maxLength={4}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.cvv ? 'border-red-300' : 'border-neutral-300'
                      } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">Billing Address</h3>

              <div className="space-y-4">
                {/* First and Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      {...register('billingAddress.firstName')}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.billingAddress?.firstName ? 'border-red-300' : 'border-neutral-300'
                      } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                    />
                    {errors.billingAddress?.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingAddress.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      {...register('billingAddress.lastName')}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.billingAddress?.lastName ? 'border-red-300' : 'border-neutral-300'
                      } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                    />
                    {errors.billingAddress?.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingAddress.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('billingAddress.email')}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.billingAddress?.email ? 'border-red-300' : 'border-neutral-300'
                    } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                  />
                  {errors.billingAddress?.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.billingAddress.email.message}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Address
                  </label>
                  <input
                    type="text"
                    {...register('billingAddress.address')}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.billingAddress?.address ? 'border-red-300' : 'border-neutral-300'
                    } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                  />
                  {errors.billingAddress?.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.billingAddress.address.message}</p>
                  )}
                </div>

                {/* City, Postal Code, Country */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      City
                    </label>
                    <input
                      type="text"
                      {...register('billingAddress.city')}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.billingAddress?.city ? 'border-red-300' : 'border-neutral-300'
                      } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                    />
                    {errors.billingAddress?.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingAddress.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      {...register('billingAddress.postalCode')}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.billingAddress?.postalCode ? 'border-red-300' : 'border-neutral-300'
                      } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                    />
                    {errors.billingAddress?.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingAddress.postalCode.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Country
                    </label>
                    <select
                      {...register('billingAddress.country')}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.billingAddress?.country ? 'border-red-300' : 'border-neutral-300'
                      } px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                    {errors.billingAddress?.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingAddress.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg bg-neutral-50 p-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-3 font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? "Processing..." : `Pay $${totalPrice.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
