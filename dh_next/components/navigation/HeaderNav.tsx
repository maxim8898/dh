"use client"

import { Link } from "@/components/navigation/Link"
import { useState } from "react"
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

const GET_CART_COUNT = gql`
  query GetCartCount {
    cart {
      totalItems
    }
  }
`

export function HeaderNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { data } = useQuery(GET_CART_COUNT, {
    pollInterval: 10000, // Poll every 10 seconds
    onCompleted: () => setMounted(true),
  })

  const cartCount = data?.cart?.totalItems || 0

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <Link href="/" className="text-2xl font-display font-bold text-primary no-underline">
              Plantify
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <nav className="flex gap-6 text-sm font-medium">
              <Link href="/" className="text-neutral-700 hover:text-primary">Home</Link>
              <Link href="/products" className="text-neutral-700 hover:text-primary">Products</Link>
              <Link href="#" className="text-neutral-700 hover:text-primary">Collections</Link>
              <Link href="#" className="text-neutral-700 hover:text-primary">About</Link>
              <Link href="#" className="text-neutral-700 hover:text-primary">Contact</Link>
            </nav>

            <div className="flex items-center gap-4">
              <div className="flex gap-4">
                {/* Search */}
                <button className="block text-neutral-600 hover:text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Account */}
                <button className="block text-neutral-600 hover:text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {/* Cart */}
                <Link href="/cart" className="block text-neutral-600 hover:text-primary relative">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {mounted && cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            {/* Cart (Mobile) */}
            <Link href="/cart" className="text-neutral-600 hover:text-primary relative">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="text-neutral-600 hover:text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <nav className="flex flex-col space-y-4 p-4 bg-white border-t border-neutral-200">
            <Link href="#" className="text-neutral-700 hover:text-primary">Home</Link>
            <Link href="/products" className="text-neutral-700 hover:text-primary">Products</Link>
            <Link href="#" className="text-neutral-700 hover:text-primary">Collections</Link>
            <Link href="#" className="text-neutral-700 hover:text-primary">About</Link>
            <Link href="#" className="text-neutral-700 hover:text-primary">Contact</Link>
            <div className="flex space-x-4 pt-2">
              <button className="text-neutral-600 hover:text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="text-neutral-600 hover:text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
