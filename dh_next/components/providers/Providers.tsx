"use client"

import { ApolloProvider } from './ApolloProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider>
      {children}
    </ApolloProvider>
  )
}
