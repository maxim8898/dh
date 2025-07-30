import { Hero } from "@/components/sections/Hero"
import { FeaturedCategories } from "@/components/sections/FeaturedCategories"
import { FeaturedProducts } from "@/components/sections/FeaturedProducts"
import { Testimonials } from "@/components/sections/Testimonials"
import { Newsletter } from "@/components/sections/Newsletter"
import type { Metadata } from "next"
import type { DrupalArticle } from "@/types"

export const metadata: Metadata = {
  description: "Shop premium indoor plants, planters, and plant care accessories for your home or office.",
}

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />
      <Testimonials />
      <Newsletter />
    </>
  )
}
