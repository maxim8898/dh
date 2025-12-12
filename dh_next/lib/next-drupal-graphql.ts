// This is an example GraphQL implementation using NextDrupalBase, a lower-level
// class that contains helper methods and no JSON:API methods.

import { NextDrupalBase } from "next-drupal"
import type {
  BaseUrl,
  EndpointSearchParams,
  NextDrupalBaseOptions,
} from "next-drupal"

const DEFAULT_API_PREFIX = "/graphql"

export class NextDrupalGraphQL extends NextDrupalBase {
  endpoint: string

  constructor(baseUrl: BaseUrl, options: NextDrupalBaseOptions = {}) {
    super(baseUrl, options)

    const { apiPrefix = DEFAULT_API_PREFIX } = options

    this.apiPrefix = apiPrefix

    this.endpoint = this.buildUrl(this.apiPrefix).toString()
  }

  async query<DataType>(payload: QueryPayload) {
    console.log('GraphQL Query:', {
      endpoint: this.endpoint,
      payload: payload,
      withAuth: !!this.auth
    })

    // Build headers with OAuth authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    // Add OAuth authentication if configured
    if (this.auth) {
      try {
        const token = await this.getAccessToken()
        if (token?.access_token) {
          headers['Authorization'] = `Bearer ${token.access_token}`
          console.log('Using OAuth authentication')
        }
      } catch (error) {
        console.error('Failed to get OAuth token:', error)
        throw new Error('OAuth authentication failed')
      }
    }

    const response = await fetch(this.endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
      headers,
      credentials: 'include', // Keep for CORS
      cache: 'no-store', // Disable Next.js fetch caching
    })

    console.log('GraphQL Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response?.ok) {
      const errorText = await response.text()
      console.error('GraphQL Error Response:', errorText)
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
    }

    const { data, errors }: QueryJsonResponse<DataType> = await response.json()

    if (errors) {
      console.error('GraphQL Errors:', errors)
      this.logger.log(errors)
      throw new Error(errors?.map((e) => e.message).join("\n") ?? "unknown")
    }

    console.log('GraphQL Success:', data)
    return data
  }

  // Since the endpoint doesn't change (even with different locales), there's
  // no need to use this method; use NextDrupalGraphQL.query() directly.
  async buildEndpoint({
    searchParams,
  }: {
    searchParams?: EndpointSearchParams
  } = {}): Promise<string> {
    return this.buildUrl(this.apiPrefix, searchParams).toString()
  }
}

type QueryPayload = {
  query: string
  variables?: Record<string, any>
}

type QueryJsonResponse<DataType> = {
  data?: DataType
  errors?: { message: string }[]
}
