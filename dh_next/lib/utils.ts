export function formatDate(input: string): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function absoluteUrl(input: string) {
  return `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}${input}`
}

export interface CartItem {
  id: string
  productId: string
  quantity: number
  addedAt: string
  product: {
    id: string
    title: string
    sku: string
  }
}

export interface AddToCartResult {
  addToCart: CartItem
}
