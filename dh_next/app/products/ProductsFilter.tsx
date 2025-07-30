"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface ProductsFilterProps {
  selectedCategories: string[]
}

const categories = [
  { id: "indoor-plants", name: "Indoor Plants" },
  { id: "outdoor-plants", name: "Outdoor Plants" },
  { id: "succulents", name: "Succulents" },
  { id: "planters", name: "Planters" },
]

export function ProductsFilter({ selectedCategories }: ProductsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams)
    const currentCategories = params.getAll("category")
    
    if (checked) {
      // Add category if not already present
      if (!currentCategories.includes(categoryId)) {
        params.append("category", categoryId)
      }
    } else {
      // Remove category
      const newCategories = currentCategories.filter(cat => cat !== categoryId)
      params.delete("category")
      newCategories.forEach(cat => params.append("category", cat))
    }
    
    router.push(`/products?${params.toString()}`)
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams)
    params.delete("category")
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">Filter by Category</h3>
        {selectedCategories.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary hover:text-primary/80 underline"
          >
            Clear all
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {categories.map((category) => (
          <label key={category.id} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.id)}
              onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary focus:ring-offset-0"
            />
            <span className="text-sm text-neutral-700">{category.name}</span>
          </label>
        ))}
      </div>
    </div>
  )
} 