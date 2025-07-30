export function Newsletter() {
  return (
    <section className="bg-primary py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="lg:py-8">
            <h2 className="text-3xl font-display font-bold text-white sm:text-4xl">
              Join Our Green Community
            </h2>

            <p className="mt-4 text-white/90">
              Subscribe to our newsletter for plant care tips, exclusive offers, and early access to new arrivals.
              We&apos;ll help you grow your indoor jungle with expert advice.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="w-full flex-1 lg:w-auto">
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full rounded-md border-0 bg-white/90 px-4 py-3 text-neutral-900 shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-neutral-500 focus:ring-2 focus:ring-inset focus:ring-white"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-white px-6 py-3 text-center text-sm font-semibold text-primary shadow hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-white/10 sm:w-auto"
              >
                Subscribe
              </button>
            </div>

            <p className="mt-4 text-sm text-white/80">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto">
            <img
              alt="Plant in a pot"
              src="https://images.unsplash.com/photo-1620127682229-33388276e540?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
              className="absolute inset-0 h-full w-full rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
