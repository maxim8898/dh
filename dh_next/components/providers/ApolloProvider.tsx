"use client"

import { ApolloProvider as ApolloProviderBase } from '@apollo/client/react'
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

// OAuth token management
let cachedToken: { access_token: string; expires_at: number } | null = null

async function getOAuthToken(): Promise<string | null> {
  const clientId = process.env.NEXT_PUBLIC_DRUPAL_CLIENT_ID
  const clientSecret = process.env.NEXT_PUBLIC_DRUPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return null
  }

  if (cachedToken && cachedToken.expires_at > Date.now()) {
    return cachedToken.access_token
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/oauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`OAuth token request failed: ${response.status}`)
    }

    const data = await response.json()

    cachedToken = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in - 60) * 1000,
    }

    console.log('OAuth token acquired successfully')
    return cachedToken.access_token
  } catch (error) {
    console.error('Failed to get OAuth token:', error)
    return null
  }
}

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_DRUPAL_BASE_URL + '/graphql',
    credentials: 'include',
  })

  const authLink = setContext(async (_, { headers }) => {
    const token = await getOAuthToken()

    if (token) {
      console.log('Using OAuth authentication')
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${token}`,
        },
      }
    }

    return { headers }
  })

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  })
}

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProviderBase client={makeClient()}>
      {children}
    </ApolloProviderBase>
  )
}
