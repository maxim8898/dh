// Example data types.
// Note: In a real-world app, you'll probably use a type generator to create
// these from your GraphQL schema.

export type NodesPath = {
  nodes: {
    path: string
  }[]
}

export type Image = {
  width: number
  height: number
  url: string
  alt: string
}

export type Author = {
  name: string
}

export type DrupalPage = {
  __typename: "NodePage"
  id: string
  status: boolean
  title: string
  path: string
  body: {
    processed: string
  }
}

export type DrupalArticle = {
  __typename: "NodeArticle"
  id: string
  status: boolean
  title: string
  path: string
  author: Author
  description: {
    processed: string
  }
  created: {
    time: string
  }
  image: Image
}

export type DrupalProduct = {
  __typename: "NodePlant"
  id: string
  status: boolean
  title: string
  path: string
  body: {
    processed: string
  }
  images: Image[]
  created?: {
    time: string
  }
}
