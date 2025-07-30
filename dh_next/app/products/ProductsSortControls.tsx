"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface ProductsSortControlsProps {
  currentSort: string
  productCount: number
}

export function ProductsSortControls({ currentSort, productCount }: ProductsSortControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("sort", sortValue)
    // Preserve existing category filters
    const categories = params.getAll("category")
    params.delete("category")
    categories.forEach(cat => params.append("category", cat))
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <label htmlFor="sort" className="text-sm font-medium text-neutral-700">
          Sort by:
        </label>
        <select
          id="sort"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="price-asc">Price: Low to High</option>
        </select>
      </div>
      <div className="text-sm text-neutral-600">
        {productCount} product{productCount !== 1 ? 's' : ''} found
      </div>
    </div>
  )
} 