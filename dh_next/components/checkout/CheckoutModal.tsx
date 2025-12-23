"use client"

import { useState, FormEvent } from "react"
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

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

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  totalPrice: number
  onSuccess: () => void
}

interface CardFormData {
  cardNumber: string
  cardName: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  billingAddress: {
    firstName: string
    lastName: string
    email: string
    address: string
    city: string
    postalCode: string
    country: string
  }
}

export function CheckoutModal({ isOpen, onClose, totalPrice, onSuccess }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [processCheckoutMutation] = useMutation(PROCESS_CHECKOUT)

  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    billingAddress: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      city: "",
      postalCode: "",
      country: "US",
    },
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CardFormData | string, string>>>({})

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {}

    // Card number validation (basic - just check length and numbers)
    const cardNumberClean = formData.cardNumber.replace(/\s/g, "")
    if (!cardNumberClean) {
      newErrors.cardNumber = "Card number is required"
    } else if (!/^\d{13,19}$/.test(cardNumberClean)) {
      newErrors.cardNumber = "Invalid card number"
    }

    // Card name validation
    if (!formData.cardName.trim()) {
      newErrors.cardName = "Cardholder name is required"
    }

    // Expiry validation
    if (!formData.expiryMonth) {
      newErrors.expiryMonth = "Month is required"
    }
    if (!formData.expiryYear) {
      newErrors.expiryYear = "Year is required"
    }

    // Check if card is expired
    if (formData.expiryMonth && formData.expiryYear) {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1
      const expYear = parseInt(formData.expiryYear)
      const expMonth = parseInt(formData.expiryMonth)

      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expiryMonth = "Card is expired"
      }
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = "CVV is required"
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = "Invalid CVV"
    }

    // Billing address validation
    if (!formData.billingAddress.firstName.trim()) {
      newErrors["billingAddress.firstName"] = "First name is required"
    }
    if (!formData.billingAddress.lastName.trim()) {
      newErrors["billingAddress.lastName"] = "Last name is required"
    }
    if (!formData.billingAddress.email.trim()) {
      newErrors["billingAddress.email"] = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingAddress.email)) {
      newErrors["billingAddress.email"] = "Invalid email address"
    }
    if (!formData.billingAddress.address.trim()) {
      newErrors["billingAddress.address"] = "Address is required"
    }
    if (!formData.billingAddress.city.trim()) {
      newErrors["billingAddress.city"] = "City is required"
    }
    if (!formData.billingAddress.postalCode.trim()) {
      newErrors["billingAddress.postalCode"] = "Postal code is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await processCheckoutMutation({
        variables: {
          cardNumber: formData.cardNumber.replace(/\s/g, ""),
          cardName: formData.cardName,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          cvv: formData.cvv,
          billingAddress: formData.billingAddress,
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
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(" ") : cleaned
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">Checkout</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
            disabled={loading}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Order Summary */}
          <div className="rounded-lg bg-neutral-50 p-4">
            <h3 className="font-semibold text-neutral-900 mb-2">Order Total</h3>
            <p className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</p>
          </div>

          {/* Card Details */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Payment Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value)
                    if (formatted.replace(/\s/g, "").length <= 19) {
                      setFormData({ ...formData, cardNumber: formatted })
                    }
                  }}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.cardNumber ? "border-red-500" : "border-neutral-300"
                  }`}
                  disabled={loading}
                />
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={formData.cardName}
                  onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.cardName ? "border-red-500" : "border-neutral-300"
                  }`}
                  disabled={loading}
                />
                {errors.cardName && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Month
                  </label>
                  <select
                    value={formData.expiryMonth}
                    onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.expiryMonth ? "border-red-500" : "border-neutral-300"
                    }`}
                    disabled={loading}
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month.toString().padStart(2, "0")}>
                        {month.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  {errors.expiryMonth && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryMonth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Year
                  </label>
                  <select
                    value={formData.expiryYear}
                    onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.expiryYear ? "border-red-500" : "border-neutral-300"
                    }`}
                    disabled={loading}
                  >
                    <option value="">YYYY</option>
                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {errors.expiryYear && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryYear}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => {
                      if (/^\d{0,4}$/.test(e.target.value)) {
                        setFormData({ ...formData, cvv: e.target.value })
                      }
                    }}
                    placeholder="123"
                    maxLength={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.cvv ? "border-red-500" : "border-neutral-300"
                    }`}
                    disabled={loading}
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Billing Address</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.billingAddress.firstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billingAddress: { ...formData.billingAddress, firstName: e.target.value },
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors["billingAddress.firstName"] ? "border-red-500" : "border-neutral-300"
                    }`}
                    disabled={loading}
                  />
                  {errors["billingAddress.firstName"] && (
                    <p className="mt-1 text-sm text-red-600">{errors["billingAddress.firstName"]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.billingAddress.lastName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billingAddress: { ...formData.billingAddress, lastName: e.target.value },
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors["billingAddress.lastName"] ? "border-red-500" : "border-neutral-300"
                    }`}
                    disabled={loading}
                  />
                  {errors["billingAddress.lastName"] && (
                    <p className="mt-1 text-sm text-red-600">{errors["billingAddress.lastName"]}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.billingAddress.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billingAddress: { ...formData.billingAddress, email: e.target.value },
                    })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors["billingAddress.email"] ? "border-red-500" : "border-neutral-300"
                  }`}
                  disabled={loading}
                />
                {errors["billingAddress.email"] && (
                  <p className="mt-1 text-sm text-red-600">{errors["billingAddress.email"]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.billingAddress.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billingAddress: { ...formData.billingAddress, address: e.target.value },
                    })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors["billingAddress.address"] ? "border-red-500" : "border-neutral-300"
                  }`}
                  disabled={loading}
                />
                {errors["billingAddress.address"] && (
                  <p className="mt-1 text-sm text-red-600">{errors["billingAddress.address"]}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.billingAddress.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billingAddress: { ...formData.billingAddress, city: e.target.value },
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors["billingAddress.city"] ? "border-red-500" : "border-neutral-300"
                    }`}
                    disabled={loading}
                  />
                  {errors["billingAddress.city"] && (
                    <p className="mt-1 text-sm text-red-600">{errors["billingAddress.city"]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.billingAddress.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billingAddress: { ...formData.billingAddress, postalCode: e.target.value },
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors["billingAddress.postalCode"] ? "border-red-500" : "border-neutral-300"
                    }`}
                    disabled={loading}
                  />
                  {errors["billingAddress.postalCode"] && (
                    <p className="mt-1 text-sm text-red-600">{errors["billingAddress.postalCode"]}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Country
                </label>
                <select
                  value={formData.billingAddress.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billingAddress: { ...formData.billingAddress, country: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-white border-t border-neutral-200 -mx-6 -mb-6 px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Complete Order</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
