import Image from "next/image"
import { Link } from "@/components/navigation/Link"

interface ProductCardProps {
  id: string
  title: string
  price: number
  image: string
  category: string
  path: string
}

export function ProductCard({ id, title, price, image, category, path }: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-card transition-all duration-300 hover:shadow-card-hover">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        <div className="absolute bottom-4 left-4">
          <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-800">
            {category}
          </span>
        </div>
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-700 shadow-md transition-colors hover:bg-primary hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-700 shadow-md transition-colors hover:bg-primary hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-4">
        <Link href={path} className="no-underline">
          <h3 className="mb-2 text-lg font-medium text-neutral-800 hover:text-primary">{title}</h3>
        </Link>
        <p className="text-lg font-semibold text-primary">${price.toFixed(2)}</p>
      </div>
    </div>
  )
}
