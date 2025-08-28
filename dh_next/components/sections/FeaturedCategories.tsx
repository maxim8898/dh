import { Link } from "@/components/navigation/Link"

export function FeaturedCategories() {
  const categories = [
    {
      id: "indoor-plants",
      name: "Indoor Plants",
      description: "Perfect for brightening up your living space",
      image: "https://images.unsplash.com/photo-1463320898484-cdee8141c787?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      path: "/products?category=indoor-plants"
    },
    {
      id: "outdoor-plants",
      name: "Outdoor Plants",
      description: "Enhance your garden or balcony",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      path: "/products?category=outdoor-plants"
    },
    {
      id: "succulents",
      name: "Succulents",
      description: "Low-maintenance plants for busy people",
      image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      path: "/products?category=succulents"
    },
    {
      id: "planters",
      name: "Planters",
      description: "Stylish pots and containers for your plants",
      image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      path: "/products?category=planters"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-neutral-900 sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Find the perfect plants for every space in your home
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.path}
              className="group relative block h-64 overflow-hidden rounded-lg bg-neutral-100 no-underline"
            >
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-bold text-white">{category.name}</h3>
                <p className="mt-1 text-sm text-white/80">{category.description}</p>
                <span className="mt-3 inline-flex items-center text-sm font-medium text-white">
                  Shop Now
                  <svg
                    className="ml-1 h-4 w-4"
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
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
