# GraphQL Starter

A next-drupal starter for building your site with Next.js and GraphQL.

## How to use

`npx create-next-app -e https://github.com/chapter-three/next-drupal-graphql-starter`

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchapter-three%2Fnext-drupal-graphql-starter&env=NEXT_PUBLIC_DRUPAL_BASE_URL,NEXT_IMAGE_DOMAIN,DRUPAL_CLIENT_ID,DRUPAL_CLIENT_SECRET&envDescription=Learn%20more%20about%20environment%20variables&envLink=https%3A%2F%2Fnext-drupal.org%2Fdocs%2Fenvironment-variables&project-name=next-drupal&demo-title=Next.js%20for%20Drupal&demo-description=A%20next-generation%20front-end%20for%20your%20Drupal%20site.&demo-url=https%3A%2F%2Fdemo.next-drupal.org&demo-image=https%3A%2F%2Fnext-drupal.org%2Fimages%2Fdemo-screenshot.jpg)

## Cart Functionality

This project includes a basic cart system with GraphQL integration:

- **Add to Cart**: Click the cart icon on any product card to add items to cart
- **GraphQL Mutation**: Uses `addToCart` mutation to add products to cart
- **Real-time Feedback**: Shows loading states and success/error messages
- **Type Safety**: Full TypeScript support for cart operations

### Cart Features

- Loading states with spinner animation
- Success/error message display
- Disabled state during operations
- Automatic message clearing after 3 seconds

## Documentation

See https://next-drupal.org
