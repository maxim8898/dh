// "use client"

import { DraftAlert } from "@/components/misc/DraftAlert"
import { HeaderNav } from "@/components/navigation/HeaderNav"
import { Footer } from "@/components/navigation/Footer"
import type { Metadata } from "next"
import type { ReactNode } from "react"

import "@/styles/globals.css"

export const metadata: Metadata = {
  title: {
    default: "Plantify | Premium Indoor Plants",
    template: "%s | Plantify",
  },
  description: "Shop premium indoor plants, planters, and plant care accessories for your home or office.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-neutral-50">
        <DraftAlert />
        <div className="flex-grow">
          <HeaderNav />
          <main className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  )
}
