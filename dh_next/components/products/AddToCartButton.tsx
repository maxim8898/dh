"use client"

import { useState, useEffect } from "react"
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { GET_CART_COUNT } from "@/components/navigation/HeaderNav"

const ADD_TO_CART = gql`
  mutation AddToCart($productId: String!, $quantity: Int) {
    addToCart(productId: $productId, quantity: $quantity) {
      id
      productId
      quantity
      addedAt
      product {
        id
        title
        sku
      }
    }
  }
`

const GET_CART = gql`
  query GetCart {
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
`

interface AddToCartButtonProps {
  productId: string
  className?: string
}

export function AddToCartButton({ productId, className = "" }: AddToCartButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [addToCartMutation] = useMutation(ADD_TO_CART, {
    refetchQueries: [{ query: GET_CART }, { query: GET_CART_COUNT }],
  })

  const handleAddToCart = async () => {
    if (isAddingToCart) return

    setIsAddingToCart(true)
    setCartMessage(null)

    try {
      const result = await addToCartMutation({
        variables: {
          productId: productId,
          quantity: 1,
        },
      })

      if (result?.data?.addToCart) {
        setCartMessage("Added to cart!")
        setTimeout(() => setCartMessage(null), 3000)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      setCartMessage("Failed to add to cart")
      setTimeout(() => setCartMessage(null), 3000)
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (!mounted) {
    return (
      <div className="mt-8">
        <button
          disabled
          className={`w-full rounded-lg bg-primary py-4 px-6 text-white font-medium transition-colors flex items-center justify-center space-x-2 opacity-50 ${className}`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Add to Cart</span>
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <button
        onClick={handleAddToCart}
        disabled={isAddingToCart}
        className={`w-full rounded-lg bg-primary py-4 px-6 text-white font-medium hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2 ${
          isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        {isAddingToCart ? (
          <>
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Adding to Cart...</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Add to Cart</span>
          </>
        )}
      </button>

      {cartMessage && (
        <div className={`mt-4 text-center text-sm font-medium ${
          cartMessage.includes('Added') ? 'text-green-600' : 'text-red-600'
        }`}>
          {cartMessage}
        </div>
      )}
    </div>
  )
}
