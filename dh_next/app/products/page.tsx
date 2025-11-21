import { ProductCard } from "@/components/products/ProductCard"
import { drupal } from "@/lib/drupal"
import type { Metadata } from "next"
import { ProductsSortControls } from "./ProductsSortControls"
import { ProductsFilter } from "./ProductsFilter"

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our complete collection of premium indoor plants",
}

interface CommerceProduct {
  id: number
  uuid: string
  title: string
  sku: string
  price: number
  body: string | null
  path: string
  images: string[]
  category: string | null
}

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getProducts() {
  try {
    const data = await drupal.query<{
      commerceProducts: CommerceProduct[]
    }>({
      query: `
        query {
          commerceProducts(limit: 50) {
            id
            uuid
            title
            sku
            price
            body
            path
            images
            category
          }
        }
      `,
    })

    return data?.commerceProducts ?? []
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const products = await getProducts()
  const resolvedSearchParams = await searchParams
  const sortBy = (resolvedSearchParams.sort as string) || "title-asc"
  const selectedCategories = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category
    : resolvedSearchParams.category
      ? [resolvedSearchParams.category]
      : []

  const filterProducts = (products: CommerceProduct[], categories: string[]) => {
    if (categories.length === 0) return products
    return products.filter(product =>
      product.category && categories.includes(product.category)
    )
  }

  const sortProducts = (products: CommerceProduct[], sortOption: string) => {
    const sortedProducts = [...products]

    switch (sortOption) {
      case "title-asc":
        return sortedProducts.sort((a, b) => a.title.localeCompare(b.title))
      case "title-desc":
        return sortedProducts.sort((a, b) => b.title.localeCompare(a.title))
      case "price-desc":
        return sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0))
      case "price-asc":
        return sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0))
      default:
        return sortedProducts
    }
  }

  const filteredProducts = filterProducts(products, selectedCategories)
  const sortedProducts = sortProducts(filteredProducts, sortBy)

  return (
    <div className="py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-neutral-900 sm:text-5xl">
          All Products
        </h1>
        <p className="mt-4 text-neutral-600">
          Browse our complete collection of premium indoor plants
        </p>
      </div>

      {/* Filters and Sort Controls */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <ProductsFilter selectedCategories={selectedCategories} />
        </div>
        
        {/* Products Section */}
        <div className="lg:col-span-3">
          <ProductsSortControls 
            currentSort={sortBy} 
            productCount={sortedProducts.length} 
          />

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.uuid}
                  id={product.uuid}
                  title={product.title}
                  price={product.price || 0}
                  image={product.images?.[0] || "/placeholder-image.jpg"}
                  category={product.category || "Uncategorized"}
                  path={product.path}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-neutral-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900">No products found</h3>
              <p className="mt-2 text-neutral-600">We couldn&apos;t find any products matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 