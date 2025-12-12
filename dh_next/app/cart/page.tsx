"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Link } from "@/components/navigation/Link"
import { drupal } from "@/lib/drupal"
import { CheckoutModal } from "@/components/checkout/CheckoutModal"

interface CartItem {
  id: string
  productId: string
  quantity: number
  addedAt: string
  product: {
    id: string
    title: string
    sku: string
    price?: number
    image?: string
  }
}

interface CartData {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

export default function CartPage() {
  const [cartData, setCartData] = useState<CartData>({
    items: [],
    totalItems: 0,
    totalPrice: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  const fetchCartData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      // Add timestamp to force fresh fetch
      const timestamp = Date.now()
      console.log(`Fetching cart data at ${timestamp}`)

      const result = await drupal.query<{ cart: CartData }>({
        query: `
          query {
            cart {
              items {
                id
                productId
                quantity
                addedAt
                product {
                  id
                  title
                  sku
                  price
                  image
                }
              }
              totalItems
              totalPrice
            }
          }
        `,
      })

      console.log('Received cart result:', result)

      if (result?.cart) {
        console.log('Setting cart data:', result.cart)
        setCartData(result.cart)
      } else {
        console.log('No cart data, setting empty cart')
        setCartData({
          items: [],
          totalItems: 0,
          totalPrice: 0
        })
      }
    } catch (err) {
      console.error("Error fetching cart data:", err)
      setError("Failed to load cart data")
    } finally {
      console.log('Loading complete')
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('CartPage mounted, fetching cart data...')
    fetchCartData()
  }, [])

  useEffect(() => {
    console.log('CartData state updated:', cartData)
  }, [cartData])

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId)
      return
    }

    try {
      console.log('Updating quantity for item:', itemId, 'to:', newQuantity)

      const result = await drupal.query({
        query: `
          mutation UpdateCartItem($itemId: String!, $quantity: Int!) {
            updateCartItem(itemId: $itemId, quantity: $quantity) {
              id
              quantity
            }
          }
        `,
        variables: {
          itemId,
          quantity: newQuantity,
        },
      })

      console.log('Update result:', result)
      console.log('Refreshing cart data...')

      // Refresh cart data after update (don't show loading spinner)
      await fetchCartData(false)

      console.log('Cart refreshed after update')
    } catch (err) {
      console.error("Error updating quantity:", err)
      setError("Failed to update quantity")
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      console.log('Removing item:', itemId)

      const result = await drupal.query({
        query: `
          mutation RemoveFromCart($itemId: String!) {
            removeFromCart(itemId: $itemId)
          }
        `,
        variables: {
          itemId,
        },
      })

      console.log('Remove result:', result)
      console.log('Refreshing cart data...')

      // Refresh cart data after removal (don't show loading spinner)
      await fetchCartData(false)

      console.log('Cart refreshed after removal')
    } catch (err) {
      console.error("Error removing item:", err)
      setError("Failed to remove item")
    }
  }

  const clearCart = async () => {
    try {
      console.log('Clearing cart...')

      const result = await drupal.query({
        query: `
          mutation ClearCart {
            clearCart
          }
        `,
      })

      console.log('Clear result:', result)
      console.log('Refreshing cart data...')

      // Refresh cart data after clearing (don't show loading spinner)
      await fetchCartData(false)

      console.log('Cart refreshed after clearing')
    } catch (err) {
      console.error("Error clearing cart:", err)
      setError("Failed to clear cart")
    }
  }

  const handleCheckoutSuccess = () => {
    // Refresh cart after successful checkout
    fetchCartData()
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-neutral-900">Error loading cart</h3>
          <p className="mt-2 text-neutral-600">{error}</p>
          <button 
            onClick={fetchCartData}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-neutral-900 sm:text-5xl">
          Shopping Cart
        </h1>
        <p className="mt-4 text-neutral-600">
          {cartData.totalItems > 0 
            ? `${cartData.totalItems} item${cartData.totalItems !== 1 ? 's' : ''} in your cart`
            : "Your cart is empty"
          }
        </p>
      </div>

      {cartData.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartData.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 rounded-lg bg-white p-6 shadow-card">
                  {/* Product Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.product.image || "/placeholder-image.jpg"}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-neutral-900">
                      {item.product.title}
                    </h3>
                    <p className="text-sm text-neutral-500">SKU: {item.product.sku}</p>
                    <p className="text-lg font-semibold text-primary">
                      ${((item.product.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
                    title="Remove item"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-card">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal ({cartData.totalItems} items)</span>
                  <span className="font-medium">${cartData.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Tax</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">${cartData.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCheckoutModal(true)}
                className="mt-6 w-full rounded-lg bg-primary py-3 px-4 text-white font-medium hover:bg-primary-dark transition-colors"
              >
                Proceed to Checkout
              </button>

              <Link 
                href="/products" 
                className="mt-4 block w-full rounded-lg border border-neutral-300 py-3 px-4 text-center text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-neutral-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="mt-6 text-2xl font-medium text-neutral-900">Your cart is empty</h3>
          <p className="mt-2 text-neutral-600">Looks like you haven&apos;t added any items to your cart yet.</p>
          <div className="mt-8">
            <Link 
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        totalPrice={cartData.totalPrice}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  )
}
