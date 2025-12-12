import { NextDrupalGraphQL } from "./next-drupal-graphql"

const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "https://dh.ddev.site"
const clientId = process.env.NEXT_PUBLIC_DRUPAL_CLIENT_ID
const clientSecret = process.env.NEXT_PUBLIC_DRUPAL_CLIENT_SECRET

console.log('Drupal Client Config:', {
  baseUrl,
  hasClientId: !!clientId,
  hasClientSecret: !!clientSecret,
  clientId: clientId,
})

// Only add auth if credentials are provided
const authConfig = clientId && clientSecret ? {
  auth: {
    clientId,
    clientSecret,
  }
} : {}

export const drupal = new NextDrupalGraphQL(baseUrl, {
  ...authConfig,
  // debug: true,
})
