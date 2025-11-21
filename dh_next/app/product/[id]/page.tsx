import { notFound } from "next/navigation"
import Image from "next/image"
import { drupal } from "@/lib/drupal"
import { Link } from "@/components/navigation/Link"

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

interface ProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  try {
    const data = await drupal.query<{
      commerceProduct: CommerceProduct
    }>({
      query: `
        query GetProduct($id: Int!) {
          commerceProduct(id: $id) {
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
      variables: {
        id: parseInt(id),
      },
    })

    return data?.commerceProduct
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export async function generateMetadata(props: ProductPageProps) {
  const { params } = props
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: product.title,
    description: product.body?.substring(0, 160) || `Buy ${product.title}`,
  }
}

export default async function ProductPage(props: ProductPageProps) {
  const { params } = props
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center space-x-2 text-sm text-neutral-600">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span className="text-neutral-900">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div>
            {product.images && product.images.length > 0 ? (
              <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 flex items-center justify-center">
                <p className="text-neutral-400">No image available</p>
              </div>
            )}

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {product.images.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
                  >
                    <Image
                      src={image}
                      alt={`${product.title} - Image ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.category && (
              <p className="mb-2 text-sm font-medium text-primary">
                {product.category}
              </p>
            )}

            <h1 className="text-4xl font-display font-bold text-neutral-900">
              {product.title}
            </h1>

            <div className="mt-4">
              <p className="text-3xl font-bold text-primary">
                ${product.price?.toFixed(2) || "0.00"}
              </p>
              {product.sku && (
                <p className="mt-2 text-sm text-neutral-600">SKU: {product.sku}</p>
              )}
            </div>

            {/* Description */}
            {product.body && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Description
                </h2>
                <div
                  className="mt-2 prose prose-neutral max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.body }}
                />
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="mt-8">
              <button className="w-full rounded-lg bg-primary py-4 px-6 text-white font-medium hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Add to Cart</span>
              </button>

              <Link
                href="/products"
                className="mt-4 block w-full rounded-lg border border-neutral-300 py-4 px-6 text-center text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
