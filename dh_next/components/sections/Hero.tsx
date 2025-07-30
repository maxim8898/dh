import { Link } from "@/components/navigation/Link"

export function Hero() {
  return (
    <section className="relative bg-neutral-100 overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:flex lg:h-[600px] lg:items-center lg:px-8">
        <div className="relative z-10 text-center lg:text-left lg:w-1/2">
          <h1 className="text-4xl font-display font-bold text-neutral-900 sm:text-5xl lg:text-6xl">
            Bring Nature <span className="text-primary">Indoors</span>
          </h1>

          <p className="mt-6 text-lg text-neutral-700 max-w-lg mx-auto lg:mx-0">
            Discover our collection of beautiful indoor plants to transform your space into a green sanctuary.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
            <Link
              href="#"
              className="block w-full rounded-md bg-primary px-8 py-3 text-center text-sm font-medium text-white shadow hover:bg-primary-dark focus:outline-none focus:ring sm:w-auto"
            >
              Shop Now
            </Link>

            <Link
              href="#"
              className="block w-full rounded-md border border-primary bg-white px-8 py-3 text-center text-sm font-medium text-primary shadow hover:bg-neutral-50 focus:outline-none focus:ring sm:w-auto"
            >
              Explore Collections
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 lg:justify-start">
            <div className="flex -space-x-2">
              <img
                alt="User"
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80"
                className="h-8 w-8 rounded-full border-2 border-white object-cover"
              />
              <img
                alt="User"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80"
                className="h-8 w-8 rounded-full border-2 border-white object-cover"
              />
              <img
                alt="User"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80"
                className="h-8 w-8 rounded-full border-2 border-white object-cover"
              />
            </div>
            <div className="text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">500+</span> happy customers
            </div>
          </div>
        </div>

        <div className="relative mt-12 h-80 lg:mt-0 lg:h-full lg:w-1/2">
          <img
            alt="Hero Plant"
            src="https://images.unsplash.com/photo-1545241047-6083a3684587?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            className="absolute inset-0 h-full w-full rounded-xl object-cover"
          />
        </div>
      </div>
    </section>
  )
}
