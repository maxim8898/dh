import { Link } from "@/components/navigation/Link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-neutral-900 mb-4">Page not found</h2>

        <p className="text-neutral-600 mb-6 text-center">
          We couldn&apos;t find the page you were looking for.
        </p>

        <div className="flex justify-center">
          <Link
            href="/"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            Return to home
          </Link>
        </div>
      </div>
    </div>
  )
}
