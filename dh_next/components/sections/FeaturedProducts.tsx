import { ProductCard } from "@/components/products/ProductCard"
import { drupal } from "@/lib/drupal"
import { Link } from "@/components/navigation/Link"
import type { DrupalProduct } from "@/types"

export async function FeaturedProducts() {

  const data = await drupal.query<{
    nodePlants: {
      nodes: DrupalProduct[]
    }
  }>({
    query: `
      query {
        nodePlants(first: 5) {
          nodes {
            title
            id
            path
            body {
              value
              processed
              format
            }
            images {
              alt
              url
            }
          }
        }
      }
    `,
  })
  const nodes = data?.nodePlants?.nodes ?? []

  return (
    <section className="py-12 bg-white sm:py-16 lg:py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-3xl font-display font-bold text-neutral-900 sm:text-4xl">
              Featured Plants
            </h2>
            <p className="mt-4 max-w-md text-neutral-600">
              Our most popular plants that everyone loves
            </p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center justify-center rounded-md border border-primary bg-white px-5 py-2 text-sm font-medium text-primary transition hover:bg-neutral-50"
          >
            View All
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {nodes.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={99.99}
              image={product.images[0].url}
              category={"Super"}
              path={product.path}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
