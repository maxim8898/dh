"use client"

import { useEffect } from 'react'

interface ErrorFallbackProps {
  error: Error
  reset: () => void
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-neutral-900 mb-4">Something went wrong</h2>

        <p className="text-neutral-600 mb-6 text-center">
          We&apos;re sorry, but we encountered an error while loading this page.
        </p>

        <div className="flex justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
